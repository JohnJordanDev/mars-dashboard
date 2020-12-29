const centralStore = window.Immutable.Map({
  user: { name: "John" },
  apod: "",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  activeRover: "Curiosity",
  allRoversData: []
});

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

const isActive = (rover, state) => {
  if (rover === state.get("activeRover")) {
    return "active";
  }
  return "";
};

// ------------------------------------------------------  COMPONENTS

const buildNavList = (roverList, state) => roverList
  .map(
    (rover) => `<button id="tab_toggle_${rover.toLowerCase()}" class="dashboard_roverList-button ${isActive(
      rover,
      state
    )}">${rover}</button>`
  )
  .join("");

const getListRoverFacts = (activeRover) => `
    <ul>
      <li>Launch Date: ${activeRover.launchDate}</li>
      <li>Landing Date: ${activeRover.landingDate}</li>
      <li>Status: ${activeRover.status}</li>
      <li>Date of most recent photos: ${activeRover.dateMostRecentPhotos}</li>   
    </ul>`;

const getActiveRoverData = (state) => {
  let indexOfActive = 0;
  const listOfRovers = state.get("allRoversData");
  state.get("allRoversData").forEach((rover, index) => {
    console.log('rover is: ', rover);
    if (rover.name === state.get("activeRover")) {
      indexOfActive = index;
    }
  });
  // Data available, but cannot get access
  console.log('This is an array: ', state.get("allRoversData"));
  console.log('but I cannot access its members: ', state.get("allRoversData").get(0));
  return state.get("allRoversData")[0];
};

const App = (state) => {
  const rovers = state.get("rovers");
  const activeRover = state.get("activeRover");
  const activeRoverData = getActiveRoverData(state);
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
                      ${buildNavList(rovers, state)}
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

// Need to use ImmutableJS here

const getUpdatedAllRoverDataList = (state, roverToAdd) => {
  // Note to Udacity Mentor: this is the only way I could find to update the "allRoversData" Array, as 
  // everything else just didn't update the  Array, or the 'push' method returned an array to the 'dummy' constant,
  // when I wanted it to return the updated copy of the original "allRoversData" Array. 
  const currentList = state.get('allRoversData');
  const dummy = currentList.push(roverToAdd);
  return currentList;
};

const getRoverData = (roverName, state) => {
  const allRoversData = state.get("allRoversData");
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
      getUpdatedAllRoverDataList(state, rover);
    });
};

window.document.addEventListener("DOMContentLoaded", () => {
  centralStore.get("rovers").forEach((rover) => {
    getRoverData(rover, centralStore);
  });
});

const isTabButtonClicked = (elemId) => elemId.includes("tab_toggle");

const capitaliseFirstLetter = (string) => string.slice(0, 1).toUpperCase() + string.slice(1);

const getActiveRoverIndex = (state) => {
  let activeRoverIndex;
  state.allRoversData.forEach((rover, index) => {
    if (rover.name === state.activeRover) {
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
  const allRoversDataCopy = state.allRoversData;
  const activeRoverIndex = getActiveRoverIndex(state);
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
    updateCentralStore(centralStore, { activeRover });
  }

  if (elemId === "image_decrementor") {
    updateActiveRoverGalleryImage(centralStore, decreaseActiveRoverImageIndex);
  }

  if (elemId === "image_incrementor") {
    updateActiveRoverGalleryImage(centralStore, increaseActiveRoverImageIndex);
  }
});
