const centralStore = window.Immutable.Map({
  user: { name: "John" },
  rovers: ["Curiosity", "Opportunity", "Spirit"]
});

window.allRoversData = [];
window.activeRover = "Curiosity";

// add our markup to the page
const root = document.getElementById("rover-root");

const render = async (rootElem, state) => {
  // eslint-disable-next-line no-param-reassign
  rootElem.innerHTML = App(state);
};

const updateCentralStore = (state, newState) => {
  const newStore = state.merge(newState);
  render(root, newStore);
};

const isActive = (rover) => {
  if (rover === window.activeRover) {
    return "active";
  }
  return "";
};

// ------------------------------------------------------  COMPONENTS

const buildNavList = (roverList) => roverList
  .map(
    (rover) => `<button id="tab_toggle_${rover.toLowerCase()}" class="dashboard_roverList-button ${isActive(rover)}">${rover}</button>`
  )
  .join("");

const getListRoverFacts = (activeRover) => `
    <ul>
      <li>Launch Date: ${activeRover.launchDate}</li>
      <li>Landing Date: ${activeRover.landingDate}</li>
      <li>Status: ${activeRover.status}</li>
      <li>Date of most recent photos: ${activeRover.dateMostRecentPhotos}</li>   
    </ul>`;

const getActiveRoverData = () => {
  let indexOfActive = 0;
  const listOfRovers = window.allRoversData;
  listOfRovers.forEach((rover, index) => {
    if (rover.name === window.activeRover) {
      indexOfActive = index;
    }
  });
  return listOfRovers[indexOfActive];
};

const App = (state) => {
  const rovers = state.get("rovers");
  const activeRover = state.get("activeRover") || window.activeRover;
  const activeRoverData = getActiveRoverData();
  console.log('activeRover: ', activeRoverData);
  if (typeof activeRoverData === "undefined") {
    return "<p>Loading...</p>";
  }
  if(typeof activeRoverData === "object") {
    return `
    <section class="dashboard_gallery">
                  <button id="image_decrementor"><</button>
                  <div>
                    <img height="300" width="300" src="${
  activeRoverData.photos[activeRoverData.currrentImageIndex].img_src
}" alt="image from ${activeRover} rover"></div>
                  <button id="image_incrementor">></button>
              </section>
              <section class="dashboard_content">
                  <nav class="dashboard_roverList">
                      ${buildNavList(rovers)}
                  </nav>
                  <section class="dashboard_roverDetails">
                      <header>
                          <h2>${activeRover}</h2>
                          <p>
                            Rover facts: 
                            ${getListRoverFacts(activeRoverData)}
                          </p>
                      </header>
                  </section>
              </section>`;
  }

};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, centralStore);
});

// ------------------------------------------------------  API CALLS

const getRoverData = (roverName, state) => {
  let data;
  const lowerRoverName = roverName.toLowerCase();

  fetch(`http://localhost:3000/${lowerRoverName}`)
    .then((res) => res.json())
    .then((roverData) => {
      data = roverData.spirit.rover;
      const rover = {
        name: roverName,
        launchDate: data.launch_date,
        landingDate: data.landing_date,
        status: data.status,
        dateMostRecentPhotos: data.max_date,
        photos: roverData.spiritPhotos.photos,
        currrentImageIndex: 0
      };
      window.allRoversData.push(rover);
      updateCentralStore(state, { allRoversData: window.allRoversData });
    });
};

window.document.addEventListener("DOMContentLoaded", () => {
  centralStore.get("rovers").forEach((rover) => {
    getRoverData(rover, centralStore);
  });
});

const isTabButtonClicked = (elemId) => elemId.includes("tab_toggle");

const capitaliseFirstLetter = (string) => string.slice(0, 1).toUpperCase() + string.slice(1);

const getActiveRoverIndex = (allRoversData) => {
  let activeRoverIndex;
  allRoversData.forEach((rover, index) => {
    if (rover.name === window.activeRover) {
      activeRoverIndex = index;
    }
  });
  return activeRoverIndex;
};

const decreaseActiveRoverImageIndex = (currentIndexP, photoList) => {
  let currentIndex = currentIndexP;
  if (currentIndex === 0) {
    currentIndex = photoList.length - 1;
  } else {
    currentIndex -= 1;
  }
  return currentIndex;
};

const increaseActiveRoverImageIndex = (currentIndexP, photoList) => {
  let currentIndex = currentIndexP;
  if (currentIndex === photoList.length - 1) {
    currentIndex = 0;
  } else {
    currentIndex += 1;
  }
  return currentIndex;
};

const updateActiveRoverGalleryImage = (state, changeCurrentIndexCb) => {
  const allRoversDataCopy = window.allRoversData;
  const activeRoverIndex = getActiveRoverIndex(allRoversDataCopy);
  const activeRover = allRoversDataCopy[activeRoverIndex];
  const photoList = activeRover.photos;
  let currentIndex = activeRover.currrentImageIndex;
  currentIndex = changeCurrentIndexCb(currentIndex, photoList);
  activeRover.currrentImageIndex = currentIndex;
  updateCentralStore(centralStore, { allRoversData: allRoversDataCopy });
};

window.document.addEventListener("click", (ev) => {
  const elemId = ev.target.id;
  if (isTabButtonClicked(elemId)) {
    const activeRover = capitaliseFirstLetter(elemId.split("_")[2]);
    window.activeRover = activeRover;
    updateCentralStore(centralStore, { activeRover });
  }

  if (elemId === "image_decrementor") {
    updateActiveRoverGalleryImage(centralStore, decreaseActiveRoverImageIndex);
  }

  if (elemId === "image_incrementor") {
    updateActiveRoverGalleryImage(centralStore, increaseActiveRoverImageIndex);
  }
});
