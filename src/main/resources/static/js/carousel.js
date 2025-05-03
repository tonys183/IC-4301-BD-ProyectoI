document.addEventListener('DOMContentLoaded', function() {
    const images = [
        'https://images.unsplash.com/photo-1470114716159-e389f8712fda?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1682667818478-0c5e3ab5f0a9?q=80',
        'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1715756220962-a1b5e52dd476?q=80',
        'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80',
        'https://images.unsplash.com/photo-1740084749457-a163be4a63ea?q=80',
        'https://images.unsplash.com/photo-1642410909175-e6abda0f213c?q=80',
        'https://images.unsplash.com/photo-1659952831291-c0c39b444a7c?q=80',
        'https://images.unsplash.com/photo-1611776724356-b0e4597b47ac?q=80',
        'https://images.unsplash.com/photo-1593523206410-c54e118df9a2?q=80',
        'https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80',
        'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?q=80'
    ];

    const carousel = document.querySelector('.carousel-images');
    const navLeft = document.querySelector('.carousel-nav-left');
    const navRight = document.querySelector('.carousel-nav-right');
    let currentIndex = 0;
    let intervalId;

    images.forEach((imgUrl, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = imgUrl;
        imgElement.alt = `Imagen ${index + 1}`;
        if (index === 0) imgElement.classList.add('active');
        carousel.appendChild(imgElement);
    });

    function goToSlide(index) {
        const images = document.querySelectorAll('.carousel-images img');

        images[currentIndex].classList.remove('active');
        currentIndex = (index + images.length) % images.length;
        images[currentIndex].classList.add('active');

        resetInterval();
    }

    navLeft.addEventListener('click', () => goToSlide(currentIndex - 1));
    navRight.addEventListener('click', () => goToSlide(currentIndex + 1));

    function resetInterval() {
        clearInterval(intervalId);
        intervalId = setInterval(() => goToSlide(currentIndex + 1), 3000);
    }
    resetInterval();

    carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
    carousel.addEventListener('mouseleave', resetInterval);
});