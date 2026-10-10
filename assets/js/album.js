// Month is written as 04 for April.
// Uses the local timezone of the person viewing the page.
// 12 April 2026, midnight in the viewer's local timezone.
const startDate = new Date("2026-04-12T00:00:00");

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

function updateCounter() {
    const elapsed = Math.max(0, Date.now() - startDate.getTime());
    const totalSeconds = Math.floor(elapsed / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysElement.textContent = days;
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");
}

updateCounter();
setInterval(updateCounter, 1000);



/*THIS IS CAROUSEL*/
// Photos must be numbered 1.jpg, 2.jpg, 3.jpg, etc.
// Update each count to match the number of photos in its folder.
const albums = {
    highlights: {
        title: "Favourite moments",
        folder: "assets/images/highlights",
    },
    memories: {
        title: "Our adventures",
        folder: "assets/images/memories",
    },
    littleMoments: {
        title: "Little moments",
        folder: "assets/images/little-moments",
    }
};

// HTML elements
const albumViewer = document.getElementById("album-viewer");
const carousel = albumViewer.querySelector(".carousel");
const carouselTitle = document.getElementById("carousel-title");

const highlightPhoto = document.getElementById("highlight-photo");
const previousPreview = document.getElementById("preview-previous");
const nextPreview = document.getElementById("preview-next");

const photoPosition = document.getElementById("photo-position");
const previousButton = document.getElementById("previous-photo");
const nextButton = document.getElementById("next-photo");

// Current selection
let currentAlbum = albums.highlights;
let currentPhoto = 0;

let isLoadingAlbum = false;

// Check whether an image can load.
function imageExists(src) {
    return new Promise(function (resolve) {
        const image = new Image();

        image.onload = function () {
            resolve(true);
        };

        image.onerror = function () {
            resolve(false);
        };

        image.src = src;
    });
}

// Count consecutive images, starting from 1.jpg.
async function countPhotos(folder) {
    let count = 0;

    while (await imageExists(`${folder}/${count + 1}.jpg`)) {
        count++;
    }

    return count;
}

// Discover the total, then display the album.
async function loadAlbum(album) {
    if (isLoadingAlbum) {
        return;
    }

    isLoadingAlbum = true;

    carouselTitle.textContent = album.title;
    photoPosition.textContent = "Loading…";

    previousButton.disabled = true;
    nextButton.disabled = true;
    carousel.style.visibility = "hidden";

    try {
        // Cache the count for this page visit.
        if (album.count === undefined) {
            album.count = await countPhotos(album.folder);
        }

        currentAlbum = album;
        currentPhoto = 0;

        if (album.count === 0) {
            photoPosition.textContent = "No photos found";
            return;
        }

        showPhoto();
        carousel.style.visibility = "visible";
    } finally {
        isLoadingAlbum = false;
    }
}

// Build a photo's path from its index.
function photoPath(index) {
    return `${currentAlbum.folder}/${index + 1}.jpg`;
}

// Update the centre photo and both previews.
function showPhoto() {
    const count = currentAlbum.count;

    const previousIndex = (currentPhoto - 1 + count) % count;
    const nextIndex = (currentPhoto + 1) % count;

    carouselTitle.textContent = currentAlbum.title;

    highlightPhoto.src = photoPath(currentPhoto);
    highlightPhoto.alt =
        `${currentAlbum.title} — photo ${currentPhoto + 1}`;

    previousPreview.src = photoPath(previousIndex);
    nextPreview.src = photoPath(nextIndex);

    const hasMultiplePhotos = count > 1;

    previousPreview.style.display =
        hasMultiplePhotos ? "block" : "none";

    nextPreview.style.display =
        hasMultiplePhotos ? "block" : "none";

    previousButton.disabled = !hasMultiplePhotos;
    nextButton.disabled = !hasMultiplePhotos;

    photoPosition.textContent = `${currentPhoto + 1} / ${count}`;
}

// Move through the photos, wrapping around at either end.
function changePhoto(direction) {
    if (isLoadingAlbum || !currentAlbum.count) {
        return;
    }

    currentPhoto =
        (currentPhoto + direction + currentAlbum.count)
        % currentAlbum.count;

    showPhoto();
}

// Arrow controls
previousButton.addEventListener("click", function () {
    changePhoto(-1);
});

nextButton.addEventListener("click", function () {
    changePhoto(1);
});

// Album cards
document.querySelectorAll(".album-card").forEach(function (card) {
    card.addEventListener("click", async function () {
        const selectedAlbum = albums[card.dataset.album];

        if (!selectedAlbum || isLoadingAlbum) {
            return;
        }

        albumViewer.scrollIntoView({ block: "start" });
        await loadAlbum(selectedAlbum);
    });
});

// Touch swiping
let swipeStart = null;

carousel.addEventListener("touchstart", function (event) {
    if (event.touches.length !== 1) {
        swipeStart = null;
        return;
    }

    swipeStart = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
    };
}, { passive: true });

carousel.addEventListener("touchend", function (event) {
    if (!swipeStart) {
        return;
    }

    const differenceX =
        event.changedTouches[0].clientX - swipeStart.x;

    const differenceY =
        event.changedTouches[0].clientY - swipeStart.y;

    swipeStart = null;

    // Ignore short gestures and vertical scrolling.
    if (
        Math.abs(differenceX) < 50 ||
        Math.abs(differenceY) >= Math.abs(differenceX)
    ) {
        return;
    }

    changePhoto(differenceX < 0 ? 1 : -1);
}, { passive: true });

carousel.addEventListener("touchcancel", function () {
    swipeStart = null;
}, { passive: true });

// Display the initial album.
loadAlbum(albums.highlights);
