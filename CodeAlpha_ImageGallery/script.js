const images = Array.from(document.querySelectorAll(".gallery-item img"));
const galleryItems = document.querySelectorAll(".gallery-item");

let currentIndex = 0;

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

// Open Lightbox
function openLightbox(image) {
    currentIndex = images.indexOf(image);
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightbox.style.display = "flex";
}

// Close Lightbox
function closeLightbox() {
    lightbox.style.display = "none";
}

// Next / Previous Image
function changeImage(direction) {
    currentIndex += direction;

    if (currentIndex >= images.length) {
        currentIndex = 0;
    }

    if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }

    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
}

// Category Filter
function filterImages(category) {
    galleryItems.forEach(item => {
        if (category === "all" || item.classList.contains(category)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Close lightbox when clicking outside the image
lightbox.addEventListener("click", function(event) {
    if (event.target === lightbox) {
        closeLightbox();
    }
});

// Keyboard navigation
document.addEventListener("keydown", function(event) {
    if (lightbox.style.display === "flex") {

        if (event.key === "ArrowRight") {
            changeImage(1);
        }

        if (event.key === "ArrowLeft") {
            changeImage(-1);
        }

        if (event.key === "Escape") {
            closeLightbox();
        }
    }
});
