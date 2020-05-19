/* No Results */
function noResults() {
    var mainDiv = document.getElementsByClassName("no-results-container")[0];
    var searchString = searchBox.value.trim()

    noRes = document.createElement("h2")
    noRes.innerHTML = "No Results found for " + searchString
    mainDiv.appendChild(noRes)
}

/* Render Sidebar Widget */
function renderCategoryWidget(parentDivId="category-sidebar") {
    var mainDiv = document.getElementById(parentDivId)

    var title = document.createElement("h3")
    title.innerHTML = "Project Type"
    mainDiv.appendChild(title)

    var list = document.createElement("ul")
    
    for (category in allCategories) {
        if (allCategories[category]["projects"].length > 0  && allCategories[category]["hidden"] != true) {
            var item = document.createElement("li")
            item.innerHTML = "<a href='#category-" + allCategories[category]['name'] + "' data-scroll>" + allCategories[category]['displayName'] + "</a>"
            list.appendChild(item)
        }
    }

    mainDiv.appendChild(list)

}

/* Runtime! */
seperateProjects()
renderCategoryWidget()
renderCategories()

/* Search Implementation */
var searchResult = allProjects  // Search Result initialization

function findMatches(query, repos) {
  if (query === '') {
      return repos
  } else {
      var options = {
        findAllMatches: true,
        threshold: 0.2,
        location: 0,
        distance: 50,
        maxPatternLength: 50,
        minMatchCharLength: 1,
        keys: [
          "name",
          "languages",
          "description",
          "keywords"
        ]
      }
      var fuse = new Fuse(repos, options)
      var result = fuse.search(query)

      return result
  }
}

var searchBox = document.getElementsByClassName('search-box')[0]

document.addEventListener('keyup', function(event) {
    /* Update the list of results with the search results */
    var newProjectsList = []
    var searchString = searchBox.value.trim()
    searchResult = findMatches(searchString, allProjects)

    // Remove all the projects
    var mainDiv = document.getElementsByClassName("project-results")[0]
    while (mainDiv.firstChild) {
        mainDiv.removeChild(mainDiv.firstChild)
    }

    var noResultContainer = document.getElementsByClassName("no-results-container")[0]
    while (noResultContainer.firstChild) {
        noResultContainer.removeChild(noResultContainer.firstChild)
    }

    for (var item of searchResult) {
        newProjectsList.push(item)
    }

    if (searchString === '') {
        renderCategories()
    } else {
        renderProjects(newProjectsList)
    }
})