/* Git Fetch */
async function gitFetch(ownerName, repoName) {
    const baseUrl = "https://api.github.com";
    let requestURL = baseUrl + "/repos/" + ownerName + "/" + repoName;
    let retData = await fetch(requestURL);
    return await retData.json()
}

/* Fetch Language */
async function gitFetchLang(ownerName, repoName) {
    const baseUrl = "https://api.github.com";
    let requestURL = baseUrl + "/repos/" + ownerName + "/" + repoName + "/languages";
    let retData = await fetch(requestURL);
    return await retData.json()
}

/* Compile Languages */
async function compileLanguages(langList) {
    // Count total size
    let totalSize = 0
    for (lang in langList) {
        totalSize = totalSize + langList[lang]
    }

    // Build Data
    let langData = []
    for (lang in langList) {
        let language = []
        language['name'] = lang
        let percent = (langList[lang] / totalSize) * 100
        language['percentage'] = Math.round(percent * 10) / 10
        language['raw'] = langList[lang]
        langData.push(language)
    }

    return langData

}

/* Build Project Instance */
async function compileProject(project) {
    ownerName = project['owner'];
    repoName = project['name'];

    let apiData = [];
    let retData = await gitFetch(ownerName, repoName);
    apiData['stats'] = [];
    apiData['description'] = retData['description'];
    apiData['homepage'] = retData['homepage'];
    apiData['license'] = retData['license'];
    apiData['language'] = retData['language'];
    apiData['stats']['watchers'] = retData['watchers'];
    apiData['stats']['stargazers'] = retData['stargazers_count'];
    apiData['stats']['forks'] = retData['forks'];
    apiData['stats']['subscribers'] = retData['subscribers_count'];
    apiData['stats']['size'] = retData['size'];
    apiData['stats']['updated'] = retData['updated_at'];

    project['apiData'] = apiData;

    // Language Data
    let rawLangData = await gitFetchLang(project['owner'], project['name']);
    let langData = await compileLanguages(rawLangData);

    project['languages'] = langData


    return project;
}

/* Generate a project card */
async function renderProject(rawProject, parentDivID="project-results") {
    let project = await compileProject(rawProject);

    var mainDiv = document.getElementById(parentDivID);

    var projectDiv = document.createElement("div");
    projectDiv.id = project['name']
    projectDiv.className = "project-card"

    projectTitle = document.createElement("h2")
    projectTitle.innerHTML = project['name']
    projectDiv.appendChild(projectTitle)

    projectDesc = document.createElement("p")
    if (project['forceDescription'] == true) {
        projectDesc.innerHTML = project['description']
    } else if (project['apiData']['description'] == "") {
        projectDesc.innerHTML = project['description']
    } else {
        projectDesc.innerHTML = project['apiData']['description']
    }
    projectDiv.appendChild(projectDesc)

    infoBar = document.createElement("div")
    infoBar.className = "infobar"
    projectDiv.appendChild(infoBar)

    primaryLang = document.createElement("span")
    primaryLang.className = "primary-language"
    primaryLang.innerHTML = project['apiData']['language']
    infoBar.appendChild(primaryLang)

    openLink = document.createElement("span")
    openLink.className = "open-link"
    openLink.innerHTML = "<a href='https://github.com/" + project['owner'] + "/" + project['name'] +"'>GitHub</a>"
    infoBar.appendChild(openLink)

    langBar = document.createElement("div")
    langBar.className = "langbar"
    projectDiv.appendChild(langBar)

    for (lang in project['languages']) {
        let langSegment = document.createElement("span")
        langSegment.className = "language-" + project['languages'][lang]['name'].toLowerCase() + " lang-segment tooltip"
        width = "width: " + project['languages'][lang]['percentage'] + "%;"
        langSegment.style.cssText = width
        langSegment.innerHTML = "<span class='tooltiptext'>" + project['languages'][lang]['name'] + " - " + project['languages'][lang]['percentage'] + "% </a>"
        langBar.appendChild(langSegment)
    }


    statsBar = document.createElement("div")
    statsBar.className = "statsBar"
    projectDiv.appendChild(statsBar)

    statForks = document.createElement("div")
    statForks.className = "stat-forks"
    statForks.innerHTML = project['apiData']['stats']['forks']
    statsBar.appendChild(statForks)

    statStars = document.createElement("div")
    statStars.className = "stat-stars"
    statStars.innerHTML = project['apiData']['stats']['stargazers']
    statsBar.appendChild(statStars)

    statWatchers = document.createElement("div")
    statWatchers.className = "stat-watchers"
    statWatchers.innerHTML = project['apiData']['stats']['watchers']
    statsBar.appendChild(statWatchers)

    statSubs = document.createElement("div")
    statSubs.className = "stat-subs"
    statSubs.innerHTML = project['apiData']['stats']['subscribers']
    statsBar.appendChild(statSubs)


    mainDiv.appendChild(projectDiv)


}

/* Split Projects into Categories */
function seperateProjects() {
    newProjects = allProjects
    for (cat in allCategories) {
        allCategories[cat]["projects"] = []

        for (project in allProjects) {
            if (allProjects[project]["category"] == allCategories[cat]["name"]) {
                allCategories[cat]["projects"].push(allProjects[project])
                allProjects[project]["taken"] = true
            }
        }
    }

    allProjects = newProjects

    // Deal with anything that has no category
    undefinedCat = []
    undefinedCat["name"] = "uncategorized"
    undefinedCat["displayName"] = "Uncategorized"
    undefinedCat["hidden"] = false
    undefinedCat["projects"] = []

    for (project in allProjects) {
        if (allProjects[project]["taken"] != true) {
            undefinedCat["projects"].push(allProjects[project])
        }
    }
    allCategories.push(undefinedCat)

}

/* Render a Category */
function renderCategory(categoryArr, parentDivId="project-results") {
    // Build the div for the category

    var mainDiv = document.getElementById(parentDivId);

    var catId = "category-" + categoryArr['name']
    var projectContainerId = catId + "-projectContainer"

    var catDiv = document.createElement("div");
    catDiv.id = catId
    catDiv.className = "category"

    var catTitle = document.createElement("h1")
    catTitle.innerHTML = categoryArr["displayName"]
    catDiv.appendChild(catTitle)

    var projectContainer = document.createElement("div")
    projectContainer.className = "project-container"
    projectContainer.id = projectContainerId
    catDiv.appendChild(projectContainer)

    for (project in categoryArr["projects"]) {
        renderProject(categoryArr["projects"][project], projectContainerId)
    }

    mainDiv.appendChild(catDiv)

}

/* Render Projects */
function renderProjects(projectList) {
    if (projectList.length > 0) {
        for (project in projectList) {
            renderProject(projectList[project])
        }
    } else {
        noResults()
    }
}

/* Render Categories */
function renderCategories() {
    for (category in allCategories) {
        if (allCategories[category]["projects"].length > 0  && allCategories[category]["hidden"] != true) {
            renderCategory(allCategories[category])
        }
    }
}

/* Render Featured */
function renderFeatured() {
    for (project in allProjects) {
        if (allProjects[project]['isFeatured'] == true) {
            renderProject(allProjects[project])
        }
    }
}