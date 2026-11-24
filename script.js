

// Sakurablüten Animation

const container = document.querySelector(".petals");

if (container) {
    for (let i = 0; i < 40; i++) {
        const petal = document.createElement("div");
        petal.classList.add("petal");

        petal.style.left = Math.random() * 100 + "%";
        petal.style.animationDuration = (6 + Math.random() * 6) + "s";
        petal.style.animationDelay = Math.random() * 8 + "s";
        petal.style.transform = `scale(${0.5 + Math.random()})`;

        container.appendChild(petal);
    }
}

// Lila Spur hinter dem Mauszeiger
const cursorTrail = document.createElement('div');
cursorTrail.className = 'cursor-trail';
cursorTrail.setAttribute('aria-hidden', 'true');
document.body.appendChild(cursorTrail);

let isDrawing = false;
let activeDrawingCanvas = null;
let activeDrawingContext = null;
let drawingPoints = [];
let activeTouchIdentifier = null;
let drawingEnabled = false;

function isHeartDrawing(points) {
    if (points.length < 12) return false;

    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const width = maxX - minX;
    const height = maxY - minY;
    if (width < 35 || height < 35 || width / height < 0.45 || width / height > 1.7) return false;

    const start = points[0];
    const end = points[points.length - 1];
    const closeEnough = Math.hypot(end.x - start.x, end.y - start.y) < width * 0.45;
    const bottomPoint = points.reduce((lowest, point) => point.y > lowest.y ? point : lowest, points[0]);
    const centerX = (minX + maxX) / 2;
    const hasCenteredPoint = Math.abs(bottomPoint.x - centerX) < width * 0.42;
    const upperPoints = points.filter((point) => point.y < minY + height * 0.45);
    const hasLeftLobe = upperPoints.some((point) => point.x < centerX - width * 0.12);
    const hasRightLobe = upperPoints.some((point) => point.x > centerX + width * 0.12);

    return closeEnough && hasCenteredPoint && hasLeftLobe && hasRightLobe;
}

function unlockDetails() {
    const details = document.getElementById('unlocked-details');
    if (!details || details.classList.contains('active')) return;
    details.classList.add('active');
    details.setAttribute('aria-hidden', 'false');
}

function createRainEffect() {
    document.querySelector('.rain-effect')?.remove();
    const rain = document.createElement('div');
    rain.className = 'rain-effect';
    rain.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < 70; index++) {
        const drop = document.createElement('span');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 1.2}s`;
        drop.style.animationDuration = `${0.55 + Math.random() * 0.45}s`;
        rain.appendChild(drop);
    }

    const lightning = document.createElement('span');
    lightning.className = 'lightning-flash';
    rain.appendChild(lightning);
    document.body.appendChild(rain);
    setTimeout(() => rain.remove(), 5000);
}

function createRamenEffect() {
    document.querySelector('.ramen-effect')?.remove();
    const ramen = document.createElement('div');
    ramen.className = 'ramen-effect';
    ramen.setAttribute('aria-hidden', 'true');
    ramen.innerHTML = '<span class="ramen-effect-emoji">🍜</span><span class="ramen-effect-text">nyam!</span>';
    document.body.appendChild(ramen);
    setTimeout(() => ramen.remove(), 3000);
}

function showColorMessages(show) {
    document.querySelector('.unlocked-details-layout')?.classList.toggle('color-messages-active', show);
}

function triggerDetailEvent(detail) {
    if (detail === 'weather') createRainEffect();
    if (detail === 'food') createRamenEffect();
    if (detail === 'color') showColorMessages(true);
}

document.querySelectorAll('.unlocked-detail').forEach((detail) => {
    detail.addEventListener('click', () => triggerDetailEvent(detail.dataset.detailEvent));
    detail.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        triggerDetailEvent(detail.dataset.detailEvent);
    });
});

function createDrawingCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.className = 'drawing-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.opacity = '1';
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.strokeStyle = 'rgb(192, 132, 252)';
    context.lineWidth = 10;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.shadowColor = 'rgba(168, 85, 247, 0.9)';
    context.shadowBlur = 12;
    return { canvas, context };
}

function beginDrawingAt(x, y) {
    const drawing = createDrawingCanvas();
    activeDrawingCanvas = drawing.canvas;
    activeDrawingContext = drawing.context;
    isDrawing = true;
    drawingPoints = [{ x, y }];
    activeDrawingContext.beginPath();
    activeDrawingContext.moveTo(x, y);
}

function startDrawing(event) {
    if (!drawingEnabled || event.button !== 0 || event.target.closest('.language-switcher')) return;
    if (isDrawing) stopDrawing();
    beginDrawingAt(event.clientX, event.clientY);
}

function draw(event) {
    if (!isDrawing || !activeDrawingContext) return;
    if ((event.buttons & 1) !== 1) {
        stopDrawing();
        return;
    }

    activeDrawingContext.lineTo(event.clientX, event.clientY);
    activeDrawingContext.save();
    activeDrawingContext.strokeStyle = 'rgba(168, 85, 247, 0.85)';
    activeDrawingContext.lineWidth = 24;
    activeDrawingContext.shadowColor = 'rgba(168, 85, 247, 0.9)';
    activeDrawingContext.shadowBlur = 18;
    activeDrawingContext.stroke();
    activeDrawingContext.restore();
    activeDrawingContext.strokeStyle = 'rgb(192, 132, 252)';
    activeDrawingContext.lineWidth = 10;
    activeDrawingContext.stroke();
    activeDrawingContext.beginPath();
    activeDrawingContext.moveTo(event.clientX, event.clientY);
    drawingPoints.push({ x: event.clientX, y: event.clientY });
}

function getActiveTouch(event) {
    return Array.from(event.touches).find((touch) => touch.identifier === activeTouchIdentifier);
}

function startTouchDrawing(event) {
    if (!drawingEnabled || event.touches.length !== 1 || isDrawing || event.target.closest('.language-switcher')) return;
    const touch = event.touches[0];
    activeTouchIdentifier = touch.identifier;
    beginDrawingAt(touch.clientX, touch.clientY);
}

function drawTouch(event) {
    const touch = getActiveTouch(event);
    if (!touch || !isDrawing || !activeDrawingContext) return;
    event.preventDefault();
    activeDrawingContext.lineTo(touch.clientX, touch.clientY);
    activeDrawingContext.save();
    activeDrawingContext.strokeStyle = 'rgba(168, 85, 247, 0.85)';
    activeDrawingContext.lineWidth = 24;
    activeDrawingContext.shadowColor = 'rgba(168, 85, 247, 0.9)';
    activeDrawingContext.shadowBlur = 18;
    activeDrawingContext.stroke();
    activeDrawingContext.restore();
    activeDrawingContext.strokeStyle = 'rgb(192, 132, 252)';
    activeDrawingContext.lineWidth = 10;
    activeDrawingContext.stroke();
    activeDrawingContext.beginPath();
    activeDrawingContext.moveTo(touch.clientX, touch.clientY);
    drawingPoints.push({ x: touch.clientX, y: touch.clientY });
}

function stopTouchDrawing(event) {
    if (activeTouchIdentifier === null) return;
    const touchEnded = Array.from(event.changedTouches).some((touch) => touch.identifier === activeTouchIdentifier);
    if (!touchEnded) return;
    if (isDrawing) stopDrawing();
    activeTouchIdentifier = null;
}

function stopDrawing(event) {
    if (event && event.button !== 0) return;
    if (!isDrawing || !activeDrawingCanvas) return;

    isDrawing = false;
    const finishedCanvas = activeDrawingCanvas;
    activeDrawingCanvas = null;
    activeDrawingContext = null;
    if (isHeartDrawing(drawingPoints)) unlockDetails();
    drawingPoints = [];
    finishedCanvas.classList.add('drawing-canvas-fade');
    setTimeout(() => finishedCanvas.remove(), 5000);
}

window.addEventListener('resize', () => {
    document.querySelectorAll('.drawing-canvas').forEach((canvas) => canvas.remove());
    isDrawing = false;
    activeDrawingCanvas = null;
    activeDrawingContext = null;
    drawingPoints = [];
    activeTouchIdentifier = null;
});
document.addEventListener('mousedown', startDrawing);
document.addEventListener('mousemove', draw);
document.addEventListener('mouseup', stopDrawing);
document.addEventListener('touchstart', startTouchDrawing, { passive: true });
document.addEventListener('touchmove', drawTouch, { passive: false });
document.addEventListener('touchend', stopTouchDrawing, { passive: true });
document.addEventListener('touchcancel', stopTouchDrawing, { passive: true });
window.addEventListener('blur', stopDrawing);

const drawingToggle = document.getElementById('drawing-toggle');

if (drawingToggle) {
    drawingToggle.addEventListener('click', () => {
        const selected = getTranslations(currentLanguage);
        drawingEnabled = !drawingEnabled;
        drawingToggle.classList.toggle('active', drawingEnabled);
        drawingToggle.setAttribute('aria-pressed', String(drawingEnabled));
        drawingToggle.setAttribute(
            'aria-label',
            drawingEnabled ? selected.drawingDisableLabel : selected.drawingEnableLabel
        );

        if (!drawingEnabled) {
            stopDrawing();
            activeTouchIdentifier = null;
        }
    });
}

let trailFrame = null;
let lastPointerPosition = null;
let lastTrailPosition = null;

document.addEventListener('mousemove', (event) => {
    lastPointerPosition = { x: event.clientX, y: event.clientY };
    if (lastTrailPosition) {
        const distance = Math.hypot(
            lastPointerPosition.x - lastTrailPosition.x,
            lastPointerPosition.y - lastTrailPosition.y
        );
        if (distance < 18) return;
    }

    if (trailFrame) return;

    trailFrame = requestAnimationFrame(() => {
        const particle = document.createElement('span');
        particle.className = 'cursor-trail-particle';
        particle.style.left = `${lastPointerPosition.x}px`;
        particle.style.top = `${lastPointerPosition.y}px`;
        cursorTrail.appendChild(particle);
        lastTrailPosition = lastPointerPosition;
        particle.addEventListener('animationend', () => particle.remove(), { once: true });
        trailFrame = null;
    });
});

const translations = {
    de: {
        pageTitle: 'Meine Webseite',
        closeLabel: 'Schließen',
        welcome: 'Willkommen auf meiner Webseite',
        tvCategoriesLabel: 'TV-Unterkategorien',
        drawingEnableLabel: 'Zeichenmodus aktivieren',
        drawingDisableLabel: 'Zeichenmodus deaktivieren',
        weatherAriaLabel: 'Lieblingswetter anzeigen',
        foodAriaLabel: 'Lieblingsessen anzeigen',
        colorAriaLabel: 'Lieblingsfarbe anzeigen',
        rainCloudLabel: 'Regenwolke',
        ramenLabel: 'Ramen',
        purpleLabel: 'Lila',
        aboutTitle: 'Zu meiner Person',
        hi: 'Hi :3',
        aboutText: 'mein Name ist Kurayami und mein Ziel ist es Fachinformatiker zu werden,<br>um anschließend in die Cybersecurity zu gelangen.<br><br>Ich bin derzeit 20 Jahre und diese Webseite ist mein erstes Projekt,<br>dass stetig mit mir weiterwachsen wird. Also schau gern ab und zu mal vorbei.<br><br>Auf dieser Seite findest du meine Hobbies, Musik, Projekte und meine Reiseziele,<br>also fackel nicht lange und schau sie dir an.',
        hobbiesTitle: 'Meine Hobbies',
        gamesLabel: 'Spiele',
        musicLabel: 'Musik',
        booksLabel: 'Bücher',
        unlockedDetailsTitle: 'Freigeschaltete Details',
        favoriteWeather: 'Lieblingswetter',
        favoriteFood: 'Lieblingsessen',
        favoriteColor: 'Lieblingsfarbe',
        favoriteWeatherValue: 'Gewitter',
        favoriteFoodValue: 'Ramen',
        favoriteColorValue: 'Dunkel lila',
        colorMessageLeft: 'Streich die Welt lila',
        colorDefinition: 'Lila<br>die königliche Farbe, die mit Weisheit, Intuition, Reflektion und Kreativität verbunden ist.',
        paintDescription: 'Zeichnen ist eins meiner weiteren Hobbies. Erst auf Papier, dann digital.<br>Mich interessieren besonders Wesen der Mythologie mit Flügeln, also Engel, Dämonen, gefallene Engel und Mischwesen.<br>Aber nicht nur normale Zeichnungen, sondern auch selbstgemachte individuelle Sticker mit verschiedenen Designs und Graffiti.<br>Probier doch mal ein Herz auf die Webseite zu malen.',
        projectsTitle: 'Projekte',
        plannedProjects: 'Geplante Projekte',
        ongoingProjects: 'Laufende Projekte',
        completedProjects: 'Abgeschlossene Projekte',
        plannedProjectsText: 'Sims-CC Änderungen\nHomelab: Netzwerk, Linux und Server',
        ongoingProjectsText: 'Meine Webseite',
        completedProjectsText: 'Keine',
        contactTitle: 'Kontakt',
        destinationsTitle: 'Meine Reiseziele',
        emailLabel: 'E-Mail',
        discordLabel: 'Discord',
        gamesText: 'Ich habe mit 6 Jahren aktiv angefangen Videospiele zu spielen.<br>Meine Hauptspiele waren Terraria und Minecraft auf der Xbox 360.<br>Gleichzeitig habe ich auf der Gamecube Simpsons, Mario Kart, Ice Age und Lego Star Wars gespielt.<br><br>Ab und zu war ich ebenfalls auf dem Gameboy unterwegs.<br><br>Zu Weihnachten habe ich im Laufe der Jahre eine WII und PSP bekommen. Dort spielte ich viel Avatar und Sims.<br>Auf der WII zusätzlich Go Vacation, Mario Kart, WII Party und Animal Crossing.<br><br>Mit 12 Jahren kaufte ich mir meine Xbox One S, worauf mein Lieblingsspiel Overwatch war und bis heute ist.<br>Zudem habe ich viel Dauntless, Fortnite, Sea of Thieves und Dead by Daylight gespielt.<br>Aber auch andere Koop- und Cozy-Games.<br><br>Im Laufe der Zeit kaufte ich mir dann auch ein DS vom Flohmarkt.<br>Mit 18 kaufte ich mir meinen PC, auf dem ich weiterhin Overwatch, Dead by Daylight, Sims 4<br>aber auch Where Winds Meet, Arc Raiders und andere Cozy-Spiele spiele.<br><br>Mit Ende 18 habe ich mir dann eine Switch gekauft, auf der ich Animal Crossing, Zelda: Breath of the Wild und<br>Stardew Valley spiele.',
        gamesIntro: 'Hier ist eine Übersicht meiner liebsten Spiele. Die Liste ist nach meiner Präferenz geordnet:',
        favoritesLabel: 'Meine Lieblingsspiele nach Ranking:',
        musicText: 'Hier findest du meine Spotify-Playlist.<br>Tipp: Wenn du dich im Browser bei Spotify anmeldest, kannst du die Songs komplett hören.<br><br>Ich spiele Klavier und konzentriere mich derzeit auf Stücke von Ludovico Einaudi.<br>Zukünftig möchte ich auch eigene Songs entwerfen und veröffentlichen.<br><br>',
        bookText: 'Ich habe leider nicht so viel Zeit zum Lesen, aber wenn ich die Zeit habe, dann findet man hier meine Lieblingsbücher.<br><br>Ein absolutes Lieblingsbuch, dessen weitere Bände ich plane zu lesen, ist Tintenherz.<br>Davon gibt es eine Trilogie mit 4 Bänden.<br>Tintenherz, Tintenblut, Tintentot und die Farbe der Rache.',
        paintText: 'Malen',
        movieLabel: 'Filme',
        seriesLabel: 'Serien',
        animeLabel: 'Animes',
        movieText: 'Thrash<br> Cardo Lake<br> World War Z<br> Day Shift<br> Bird Box<br> The Last House<br> Nirgendwo<br> Damsel<br> Troll<br> Die Rettung der uns bekannten Welt<br> Ugly<br> Twisters<br> ziemlich betse Freunde<br> They see you<br> Der Gesang der Flusskrebse<br> Veronica<br> Drachen zähmen leicht gemacht (1, 2, 3)<br> Avatar - Aufbruch nach Pandora<br> Avatar: The Way of Water<br> Avatar: Fire and Ash<br> Harry Potter<br> Der Herr der Ringe',
        seriesText: 'Shadowhunters<br> Avatar der Herr der Elemente<br> Dragons auf zu neuen Ufern<br> The Witcher<br> Locke & Key<br> Outer Banks<br> Outlander<br> Stranger Things',
        animeText: 'KPOP Demon Hunters<br> Arcane<br> Demon Slayer<br> JUjutsu Kaisen<br> Solo Leveling<br> Kuroko`s Basketball<br> Hell`s Paradise<br> Gachiakuta<br> Avatar der Herr der Elemente<br> Atelier of Witch Had<br> Die Tagebücher der Apothekerin<br> Food Wars! Shokugeki no soma<br> Haikyuu!<br> Sword Art Online<br> Darling in the FRANXX<br> Campfire cooking in another world with my absurd skill<br> Solo camping for two<br> Violet Evergarden<br> Der Prinz der Drachen der geheimnisvolle Aaravos<br> Suzume<br> Rick and Morty<br> The witcher sirens of the deep<br> Free! - Iwatobi swim club<br> Der Sommer in dem Hikaru starb<br> Given<br> Yuri!!! on ICE<br> Cherry Magic! Thrity years of virginity make you a wizard?!<br> Dakaichi - I`m being harassed by the sexiest man of the year-',
        movieDetail: 'Filme: Ich schaue gern spannende, atmosphärische Filme mit starker Story und coolen Soundtracks.',
        translateLabel: 'Übersetzen',
        footerText: '🌙 Erstellt von Kurayami · 2026'
    },
    en: {
        pageTitle: 'My website',
        closeLabel: 'Close',
        welcome: 'Welcome to my website',
        tvCategoriesLabel: 'TV categories',
        drawingEnableLabel: 'Enable drawing mode',
        drawingDisableLabel: 'Disable drawing mode',
        weatherAriaLabel: 'Show favorite weather',
        foodAriaLabel: 'Show favorite food',
        colorAriaLabel: 'Show favorite color',
        rainCloudLabel: 'Rain cloud',
        ramenLabel: 'Ramen',
        purpleLabel: 'Purple',
        aboutTitle: 'About me',
        hi: 'Hi :3',
        aboutText: 'My name is Kurayami, and my goal is to become an IT specialist,<br>then move into cybersecurity.<br><br>I am currently 20 years old, and this website is my first project,<br>which will continue to grow with me. Feel free to visit from time to time.<br><br>On this page you will find my hobbies, music, projects, and travel destinations,<br>so take a look around.',
        hobbiesTitle: 'My hobbies',
        gamesLabel: 'Games',
        musicLabel: 'Music',
        booksLabel: 'Books',
        unlockedDetailsTitle: 'Unlocked details',
        favoriteWeather: 'Favorite weather',
        favoriteFood: 'Favorite food',
        favoriteColor: 'Favorite color',
        favoriteWeatherValue: 'Thunderstorm',
        favoriteFoodValue: 'Ramen',
        favoriteColorValue: 'Dark purple',
        colorMessageLeft: 'Paint the world purple',
        colorDefinition: 'Purple<br>the royal color associated with wisdom, intuition, reflection and creativity.',
        paintDescription: 'Drawing is one of my other hobbies. First on paper, then digitally.<br>I am especially interested in winged mythological beings, such as angels, demons, fallen angels and hybrids.<br>Not only regular drawings, but also handmade custom stickers with different designs and graffiti.<br>Why not try drawing a heart on the website?',
        projectsTitle: 'Projects',
        plannedProjects: 'Planned projects',
        ongoingProjects: 'Ongoing projects',
        completedProjects: 'Completed projects',
        plannedProjectsText: 'Sims CC changes\nHomelab: Networking, Linux and servers',
        ongoingProjectsText: 'My website',
        completedProjectsText: 'None',
        contactTitle: 'Contact',
        destinationsTitle: 'Travel destinations',
        emailLabel: 'Email',
        discordLabel: 'Discord',
        gamesText: 'I started playing video games actively at the age of 6.<br>My main games were Terraria and Minecraft on the Xbox 360.<br>I also played Simpsons, Mario Kart, Ice Age and Lego Star Wars on the GameCube.<br><br>Sometimes I also played on the Game Boy.<br><br>At Christmas, over the years I received a Wii and a PSP. I played a lot of Avatar and The Sims there.<br>On the Wii I also played Go Vacation, Mario Kart, Wii Party and Animal Crossing.<br><br>At 12, I bought my Xbox One S, where my favorite game was Overwatch and still is today.<br>I also played a lot of Dauntless, Fortnite, Sea of Thieves and Dead by Daylight.<br>And other co-op and cozy games.<br><br>Over time I also bought a DS from a flea market.<br>At 18, I bought my PC, on which I still play Overwatch, Dead by Daylight, Sims 4<br>as well as Where Winds Meet, Arc Raiders and other cozy games.<br><br>At the end of 18, I bought a Switch, on which I play Animal Crossing, Zelda: Breath of the Wild and<br>Stardew Valley.',
        gamesIntro: 'Here is an overview of my favorite games. The list is ordered by my preference:',
        favoritesLabel: 'My favorite games by ranking:',
        musicText: 'Here you can find my Spotify playlist.<br>Tip: If you log in to Spotify in your browser, you can listen to the songs in full.<br><br>I play piano and currently focus on pieces by Ludovico Einaudi.<br>In the future, I would also like to create and release my own songs.<br><br>',
        bookText: 'I unfortunately do not have much time to read, but when I do, this is where you will find my favorite books.<br><br>One of my absolute favorite books, whose further volumes I plan to read, is Inkheart.<br>There is a trilogy with 4 volumes.<br>Inkheart, Inkblood, Inkdeath and The Color of Revenge.',
        paintText: 'Painting',
        movieLabel: 'Movies',
        seriesLabel: 'Series',
        animeLabel: 'Anime',
        movieText: 'Thrash<br> Cardo Lake<br> World War Z<br> Day Shift<br> Bird Box<br> The Last House<br> Nirgendwo<br> Damsel<br> Troll<br> Die Rettung der uns bekannten Welt<br> Ugly<br> Twisters<br> ziemlich betse Freunde<br> They see you<br> Der Gesang der Flusskrebse<br> Veronica<br> How to Train Your Dragon (1, 2, 3)<br> Avatar - Aufbruch nach Pandora<br> Avatar: The Way of Water<br> Avatar: Fire and Ash<br> Harry Potter<br> The Lord of the Rings',
        seriesText: 'Shadowhunters<br> Avatar der Herr der Elemente<br> Dragons auf zu neuen Ufern<br> The Witcher<br> Locke & Key<br> Outer Banks<br> Outlander<br> Stranger Things',
        animeText: 'KPOP Demon Hunters<br> Arcane<br> Demon Slayer<br> JUjutsu Kaisen<br> Solo Leveling<br> Kuroko`s Basketball<br> Hell`s Paradise<br> Gachiakuta<br> Avatar der Herr der Elemente<br> Atelier of Witch Had<br> Die Tagebücher der Apothekerin<br> Food Wars! Shokugeki no soma<br> Haikyuu!<br> Sword Art Online<br> Darling in the FRANXX<br> Campfire cooking in another world with my absurd skill<br> Solo camping for two<br> Violet Evergarden<br> Der Prinz der Drachen der geheimnisvolle Aaravos<br> Suzume<br> Rick and Morty<br> The witcher sirens of the deep<br> Free! - Iwatobi swim club<br> Der Sommer in dem Hikaru starb<br> Given<br> Yuri!!! on ICE<br> Cherry Magic! Thrity years of virginity make you a wizard?!<br> Dakaichi - I`m being harassed by the sexiest man of the year-',
        movieDetail: 'Movies: I really enjoy exciting, atmospheric films with a strong story and a great soundtrack.',
        translateLabel: 'Translate',
        footerText: '🌙 Made by Kurayami · 2026'
    },
    fr: {
        pageTitle: 'Mon site web',
        closeLabel: 'Fermer',
        welcome: 'Bienvenue sur mon site',
        tvCategoriesLabel: 'Catégories TV',
        drawingEnableLabel: 'Activer le mode dessin',
        drawingDisableLabel: 'Désactiver le mode dessin',
        weatherAriaLabel: 'Afficher la météo préférée',
        foodAriaLabel: 'Afficher le plat préféré',
        colorAriaLabel: 'Afficher la couleur préférée',
        rainCloudLabel: 'Nuage de pluie',
        ramenLabel: 'Ramen',
        purpleLabel: 'Violet',
        aboutTitle: 'À propos de moi',
        hi: 'Salut :3',
        aboutText: 'Je m\'appelle Kurayami et mon objectif est de devenir informaticien,<br>puis de me diriger vers la cybersécurité.<br><br>J\'ai actuellement 20 ans et ce site est mon premier projet,<br>qui évoluera avec moi. N\'hésitez pas à revenir de temps en temps.<br><br>Sur cette page, vous trouverez mes hobbies, ma musique, mes projets et mes destinations de voyage,<br>alors prenez le temps de découvrir le site.',
        hobbiesTitle: 'Mes hobbies',
        gamesLabel: 'Jeux',
        musicLabel: 'Musique',
        booksLabel: 'Livres',
        unlockedDetailsTitle: 'Détails débloqués',
        favoriteWeather: 'Météo préférée',
        favoriteFood: 'Plat préféré',
        favoriteColor: 'Couleur préférée',
        favoriteWeatherValue: 'Orage',
        favoriteFoodValue: 'Ramen',
        favoriteColorValue: 'Violet foncé',
        colorMessageLeft: 'Peins le monde en violet',
        colorDefinition: 'Violet<br>la couleur royale associée à la sagesse, l’intuition, la réflexion et la créativité.',
        paintDescription: 'Le dessin est l’un de mes autres loisirs. D’abord sur papier, puis en numérique.<br>Je m’intéresse particulièrement aux créatures mythologiques ailées, comme les anges, les démons, les anges déchus et les êtres hybrides.<br>Je ne fais pas seulement des dessins classiques, mais aussi des autocollants personnalisés faits main avec différents designs et des graffitis.<br>Essaie donc de dessiner un cœur sur le site web.',
        projectsTitle: 'Projets',
        plannedProjects: 'Projets prévus',
        ongoingProjects: 'Projets en cours',
        completedProjects: 'Projets terminés',
        plannedProjectsText: 'Modifications de CC Sims\nHomelab : réseau, Linux et serveurs',
        ongoingProjectsText: 'Mon site web',
        completedProjectsText: 'Aucun',
        contactTitle: 'Contact',
        destinationsTitle: 'Destinations de voyage',
        emailLabel: 'E-mail',
        discordLabel: 'Discord',
        gamesText: 'J\'ai commencé à jouer aux jeux vidéo activement à l\'âge de 6 ans.<br>Mes jeux préférés étaient Terraria et Minecraft sur Xbox 360.<br>J\'ai aussi joué à Simpsons, Mario Kart, Ice Age et Lego Star Wars sur GameCube.<br><br>J\'ai aussi joué occasionnellement sur Game Boy.<br><br>Noël a souvent été l\'occasion d\'obtenir une Wii et une PSP au fil des années. J\'ai beaucoup joué à Avatar et Sims.<br>Sur la Wii, j\'ai aussi joué à Go Vacation, Mario Kart, Wii Party et Animal Crossing.<br><br>À 12 ans, j\'ai acheté ma Xbox One S, sur laquelle mon jeu préféré était Overwatch et l\'est encore aujourd\'hui.<br>J\'ai aussi beaucoup joué à Dauntless, Fortnite, Sea of Thieves et Dead by Daylight.<br>Et à d\'autres jeux coop et cosy.<br><br>Au fil du temps, j\'ai aussi acheté un DS sur le bon marché.<br>À 18 ans, j\'ai acheté mon PC, sur lequel je continue à jouer à Overwatch, Dead by Daylight, Sims 4<br>ainsi qu\'à Where Winds Meet, Arc Raiders et d\'autres jeux cosy.<br><br>À la fin de 18 ans, j\'ai acheté une Switch sur laquelle je joue à Animal Crossing, Zelda : Breath of the Wild et<br>Stardew Valley.',
        gamesIntro: 'Voici un aperçu de mes jeux préférés. La liste est classée selon mes préférences :',
        favoritesLabel: 'Mes jeux préférés par classement :',
        musicText: 'Tu trouveras ici ma playlist Spotify.<br>Astuce : si tu te connectes à Spotify dans ton navigateur, tu peux écouter les chansons en entier.<br><br>Je joue du piano et je me concentre actuellement sur des morceaux de Ludovico Einaudi.<br>À l’avenir, j’aimerais aussi créer et publier mes propres chansons.<br><br>',
        bookText: 'Je n\'ai malheureusement pas beaucoup de temps pour lire, mais quand j\'en ai, c\'est ici que tu trouveras mes livres préférés.<br><br>Un de mes livres favoris, dont je compte lire les autres tomes, est Tintenherz.<br>Il existe une trilogie en 4 volumes.<br>Tintenherz, Tintenblut, Tintentot et la couleur de la vengeance.',
        paintText: 'Peinture',
        movieLabel: 'Films',
        seriesLabel: 'Séries',
        animeLabel: 'Anime',
        movieText: 'Thrash<br> Cardo Lake<br> World War Z<br> Day Shift<br> Bird Box<br> The Last House<br> Nirgendwo<br> Damsel<br> Troll<br> Die Rettung der uns bekannten Welt<br> Ugly<br> Twisters<br> ziemlich betse Freunde<br> They see you<br> Der Gesang der Flusskrebse<br> Veronica<br> Dragons (1, 2, 3)<br> Avatar - Aufbruch nach Pandora<br> Avatar: The Way of Water<br> Avatar: Fire and Ash<br> Harry Potter<br> Le Seigneur des anneaux',
        seriesText: 'Shadowhunters<br> Avatar der Herr der Elemente<br> Dragons auf zu neuen Ufern<br> The Witcher<br> Locke & Key<br> Outer Banks<br> Outlander<br> Stranger Things',
        animeText: 'KPOP Demon Hunters<br> Arcane<br> Demon Slayer<br> JUjutsu Kaisen<br> Solo Leveling<br> Kuroko`s Basketball<br> Hell`s Paradise<br> Gachiakuta<br> Avatar der Herr der Elemente<br> Atelier of Witch Had<br> Die Tagebücher der Apothekerin<br> Food Wars! Shokugeki no soma<br> Haikyuu!<br> Sword Art Online<br> Darling in the FRANXX<br> Campfire cooking in another world with my absurd skill<br> Solo camping for two<br> Violet Evergarden<br> Der Prinz der Drachen der geheimnisvolle Aaravos<br> Suzume<br> Rick and Morty<br> The witcher sirens of the deep<br> Free! - Iwatobi swim club<br> Der Sommer in dem Hikaru starb<br> Given<br> Yuri!!! on ICE<br> Cherry Magic! Thrity years of virginity make you a wizard?!<br> Dakaichi - I`m being harassed by the sexiest man of the year-',
        movieDetail: 'Films : J\'aime particulièrement les films captivants et atmosphériques avec une histoire forte et une superbe bande sonore.',
        translateLabel: 'Traduire',
        footerText: '🌙 Créé par Kurayami · 2026'
    },
    es: {
        pageTitle: 'Mi sitio web',
        closeLabel: 'Cerrar',
        welcome: 'Bienvenido a mi sitio web',
        tvCategoriesLabel: 'Categorías de TV',
        drawingEnableLabel: 'Activar modo de dibujo',
        drawingDisableLabel: 'Desactivar modo de dibujo',
        weatherAriaLabel: 'Mostrar clima favorito',
        foodAriaLabel: 'Mostrar comida favorita',
        colorAriaLabel: 'Mostrar color favorito',
        rainCloudLabel: 'Nube de lluvia',
        ramenLabel: 'Ramen',
        purpleLabel: 'Morado',
        aboutTitle: 'Sobre mí',
        hi: 'Hola :3',
        aboutText: 'Me llamo Kurayami y mi objetivo es convertirme en informático,<br>para luego entrar en ciberseguridad.<br><br>Actualmente tengo 20 años y esta página es mi primer proyecto,<br>que seguirá creciendo conmigo. No dudes en visitarla de vez en cuando.<br><br>En esta página encontrarás mis hobbies, música, proyectos y destinos de viaje,<br>así que echa un vistazo.',
        hobbiesTitle: 'Mis hobbies',
        gamesLabel: 'Juegos',
        musicLabel: 'Música',
        booksLabel: 'Libros',
        unlockedDetailsTitle: 'Detalles desbloqueados',
        favoriteWeather: 'Clima favorito',
        favoriteFood: 'Comida favorita',
        favoriteColor: 'Color favorito',
        favoriteWeatherValue: 'Tormenta',
        favoriteFoodValue: 'Ramen',
        favoriteColorValue: 'Morado oscuro',
        colorMessageLeft: 'Pinta el mundo de morado',
        colorDefinition: 'Morado<br>el color real asociado con la sabiduría, la intuición, la reflexión y la creatividad.',
        paintDescription: 'Dibujar es una de mis otras aficiones. Primero en papel y después en formato digital.<br>Me interesan especialmente los seres mitológicos con alas, como ángeles, demonios, ángeles caídos y seres híbridos.<br>No solo hago dibujos normales, sino también pegatinas personalizadas hechas a mano con distintos diseños y grafitis.<br>Prueba a dibujar un corazón en la página web.',
        projectsTitle: 'Proyectos',
        plannedProjects: 'Proyectos planeados',
        ongoingProjects: 'Proyectos en curso',
        completedProjects: 'Proyectos terminados',
        plannedProjectsText: 'Cambios de CC de Los Sims\nHomelab: redes, Linux y servidores',
        ongoingProjectsText: 'Mi sitio web',
        completedProjectsText: 'Ninguno',
        contactTitle: 'Contacto',
        destinationsTitle: 'Destinos de viaje',
        emailLabel: 'Correo electrónico',
        discordLabel: 'Discord',
        gamesText: 'Empecé a jugar videojuegos activamente a los 6 años.<br>Mis juegos principales fueron Terraria y Minecraft en la Xbox 360.<br>También jugué a Simpsons, Mario Kart, Ice Age y Lego Star Wars en la GameCube.<br><br>De vez en cuando también estuve en el Game Boy.<br><br>En Navidad, a lo largo de los años recibí una Wii y una PSP. Allí jugué mucho a Avatar y The Sims.<br>En la Wii también jugué a Go Vacation, Mario Kart, Wii Party y Animal Crossing.<br><br>A los 12 años compré mi Xbox One S, donde mi juego favorito era Overwatch y sigue siéndolo.<br>También jugué mucho a Dauntless, Fortnite, Sea of Thieves y Dead by Daylight.<br>Y a otros juegos cooperativos y cozy.<br><br>Con el tiempo también compré un DS de segunda mano.<br>A los 18 compré mi PC, en el que sigo jugando a Overwatch, Dead by Daylight, Sims 4<br>y también a Where Winds Meet, Arc Raiders y otros juegos cozy.<br><br>A finales de los 18 compré una Switch, en la que juego a Animal Crossing, Zelda: Breath of the Wild y<br>Stardew Valley.',
        gamesIntro: 'Aquí tienes un resumen de mis juegos favoritos. La lista está ordenada por mi preferencia:',
        favoritesLabel: 'Mis juegos favoritos por ranking:',
        musicText: 'Aquí encontrarás mi lista de Spotify.<br>Consejo: si inicias sesión en Spotify desde tu navegador, podrás escuchar las canciones completas.<br><br>Toco el piano y actualmente me concentro en piezas de Ludovico Einaudi.<br>En el futuro también me gustaría crear y publicar mis propias canciones.<br><br>',
        bookText: 'Lamentablemente no tengo mucho tiempo para leer, pero cuando lo tengo, aquí es donde encontrarás mis libros favoritos.<br><br>Uno de mis libros favoritos, cuyos siguientes volúmenes pienso leer, es Tintenherz.<br>Hay una trilogía de 4 volúmenes.<br>Tintenherz, Tintenblut, Tintentot y El color de la venganza.',
        paintText: 'Pintura',
        movieLabel: 'Películas',
        seriesLabel: 'Series',
        animeLabel: 'Anime',
        movieText: 'Thrash<br> Cardo Lake<br> World War Z<br> Day Shift<br> Bird Box<br> The Last House<br> Nirgendwo<br> Damsel<br> Troll<br> Die Rettung der uns bekannten Welt<br> Ugly<br> Twisters<br> ziemlich betse Freunde<br> They see you<br> Der Gesang der Flusskrebse<br> Veronica<br> Cómo entrenar a tu dragón (1, 2, 3)<br> Avatar - Aufbruch nach Pandora<br> Avatar: The Way of Water<br> Avatar: Fire and Ash<br> Harry Potter<br> El Señor de los Anillos',
        seriesText: 'Shadowhunters<br> Avatar der Herr der Elemente<br> Dragons auf zu neuen Ufern<br> The Witcher<br> Locke & Key<br> Outer Banks<br> Outlander<br> Stranger Things',
        animeText: 'KPOP Demon Hunters<br> Arcane<br> Demon Slayer<br> JUjutsu Kaisen<br> Solo Leveling<br> Kuroko`s Basketball<br> Hell`s Paradise<br> Gachiakuta<br> Avatar der Herr der Elemente<br> Atelier of Witch Had<br> Die Tagebücher der Apothekerin<br> Food Wars! Shokugeki no soma<br> Haikyuu!<br> Sword Art Online<br> Darling in the FRANXX<br> Campfire cooking in another world with my absurd skill<br> Solo camping for two<br> Violet Evergarden<br> Der Prinz der Drachen der geheimnisvolle Aaravos<br> Suzume<br> Rick and Morty<br> The witcher sirens of the deep<br> Free! - Iwatobi swim club<br> Der Sommer in dem Hikaru starb<br> Given<br> Yuri!!! on ICE<br> Cherry Magic! Thrity years of virginity make you a wizard?!<br> Dakaichi - I`m being harassed by the sexiest man of the year-',
        movieDetail: 'Películas: Me gustan mucho las películas emocionantes y atmosféricas con historias sólidas y bandas sonoras geniales.',
        translateLabel: 'Traducir',
        footerText: '🌙 Creado por Kurayami · 2026'
    },
    it: {
        pageTitle: 'Il mio sito web',
        closeLabel: 'Chiudi',
        welcome: 'Benvenuto sul mio sito',
        tvCategoriesLabel: 'Categorie TV',
        drawingEnableLabel: 'Attiva modalità disegno',
        drawingDisableLabel: 'Disattiva modalità disegno',
        weatherAriaLabel: 'Mostra il meteo preferito',
        foodAriaLabel: 'Mostra il cibo preferito',
        colorAriaLabel: 'Mostra il colore preferito',
        rainCloudLabel: 'Nuvola di pioggia',
        ramenLabel: 'Ramen',
        purpleLabel: 'Viola',
        aboutTitle: 'Chi sono',
        hi: 'Ciao :3',
        aboutText: 'Mi chiamo Kurayami e il mio obiettivo è diventare informatico,<br>per poi entrare nel campo della cybersecurity.<br><br>Ho 20 anni e questo sito è il mio primo progetto,<br>che crescerà con me. Passa a trovarmi ogni tanto.<br><br>In questa pagina troverai i miei hobby, la musica, i progetti e le destinazioni di viaggio,<br>quindi dai un\'occhiata.',
        hobbiesTitle: 'I miei hobby',
        gamesLabel: 'Giochi',
        musicLabel: 'Musica',
        booksLabel: 'Libri',
        unlockedDetailsTitle: 'Dettagli sbloccati',
        favoriteWeather: 'Meteo preferito',
        favoriteFood: 'Cibo preferito',
        favoriteColor: 'Colore preferito',
        favoriteWeatherValue: 'Temporale',
        favoriteFoodValue: 'Ramen',
        favoriteColorValue: 'Viola scuro',
        colorMessageLeft: 'Dipingi il mondo di viola',
        colorDefinition: 'Viola<br>il colore regale associato a saggezza, intuizione, riflessione e creatività.',
        paintDescription: 'Disegnare è uno dei miei altri hobby. Prima su carta, poi in digitale.<br>Mi interessano soprattutto le creature mitologiche alate, come angeli, demoni, angeli caduti ed esseri ibridi.<br>Non solo disegni normali, ma anche adesivi personalizzati fatti a mano con design diversi e graffiti.<br>Prova a disegnare un cuore sul sito web.',
        projectsTitle: 'Progetti',
        plannedProjects: 'Progetti pianificati',
        ongoingProjects: 'Progetti in corso',
        completedProjects: 'Progetti completati',
        plannedProjectsText: 'Modifiche CC di The Sims\nHomelab: rete, Linux e server',
        ongoingProjectsText: 'Il mio sito web',
        completedProjectsText: 'Nessuno',
        contactTitle: 'Contatti',
        destinationsTitle: 'Destinazioni di viaggio',
        emailLabel: 'E-mail',
        discordLabel: 'Discord',
        gamesText: 'Ho iniziato a giocare ai videogiochi attivamente a 6 anni.<br>I miei giochi principali erano Terraria e Minecraft sulla Xbox 360.<br>Ho giocato anche a Simpsons, Mario Kart, Ice Age e Lego Star Wars su GameCube.<br><br>A volte giocavo anche al Game Boy.<br><br>A Natale, nel corso degli anni ho ricevuto una Wii e una PSP. Lì ho giocato molto a Avatar e Sims.<br>Sulla Wii ho giocato anche a Go Vacation, Mario Kart, Wii Party e Animal Crossing.<br><br>A 12 anni ho comprato la mia Xbox One S, dove il mio gioco preferito era Overwatch e lo è ancora oggi.<br>Ho giocato molto anche a Dauntless, Fortnite, Sea of Thieves e Dead by Daylight.<br>E ad altri giochi coop e cozy.<br><br>Col passare del tempo ho comprato anche un DS usato.<br>A 18 anni ho comprato il mio PC, su cui continuo a giocare a Overwatch, Dead by Daylight, Sims 4<br>e anche a Where Winds Meet, Arc Raiders e altri giochi cozy.<br><br>A fine 18 anni ho comprato una Switch, su cui gioco a Animal Crossing, Zelda: Breath of the Wild e<br>Stardew Valley.',
        gamesIntro: 'Ecco una panoramica dei miei giochi preferiti. La lista è ordinata in base alle mie preferenze:',
        favoritesLabel: 'I miei giochi preferiti in classifica:',
        musicText: 'Qui troverai la mia playlist Spotify.<br>Consiglio: se accedi a Spotify dal browser, puoi ascoltare le canzoni per intero.<br><br>Suono il pianoforte e attualmente mi concentro sui brani di Ludovico Einaudi.<br>In futuro vorrei anche creare e pubblicare canzoni mie.<br><br>',
        bookText: 'Purtroppo non ho molto tempo da dedicare alla lettura, ma quando ce l\'ho, è qui che trovi i miei libri preferiti.<br><br>Uno dei miei libri preferiti, i cui volumi voglio leggere, è Tintenherz.<br>Esiste una trilogia di 4 volumi.<br>Tintenherz, Tintenblut, Tintentot e Il colore della vendetta.',
        paintText: 'Pittura',
        movieLabel: 'Film',
        seriesLabel: 'Serie',
        animeLabel: 'Anime',
        movieText: 'Thrash<br> Cardo Lake<br> World War Z<br> Day Shift<br> Bird Box<br> The Last House<br> Nirgendwo<br> Damsel<br> Troll<br> Die Rettung der uns bekannten Welt<br> Ugly<br> Twisters<br> ziemlich betse Freunde<br> They see you<br> Der Gesang der Flusskrebse<br> Veronica<br> Dragon Trainer (1, 2, 3)<br> Avatar - Aufbruch nach Pandora<br> Avatar: The Way of Water<br> Avatar: Fire and Ash<br> Harry Potter<br> Il Signore degli Anelli',
        seriesText: 'Shadowhunters<br> Avatar der Herr der Elemente<br> Dragons auf zu neuen Ufern<br> The Witcher<br> Locke & Key<br> Outer Banks<br> Outlander<br> Stranger Things',
        animeText: 'KPOP Demon Hunters<br> Arcane<br> Demon Slayer<br> JUjutsu Kaisen<br> Solo Leveling<br> Kuroko`s Basketball<br> Hell`s Paradise<br> Gachiakuta<br> Avatar der Herr der Elemente<br> Atelier of Witch Had<br> Die Tagebücher der Apothekerin<br> Food Wars! Shokugeki no soma<br> Haikyuu!<br> Sword Art Online<br> Darling in the FRANXX<br> Campfire cooking in another world with my absurd skill<br> Solo camping for two<br> Violet Evergarden<br> Der Prinz der Drachen der geheimnisvolle Aaravos<br> Suzume<br> Rick and Morty<br> The witcher sirens of the deep<br> Free! - Iwatobi swim club<br> Der Sommer in dem Hikaru starb<br> Given<br> Yuri!!! on ICE<br> Cherry Magic! Thrity years of virginity make you a wizard?!<br> Dakaichi - I`m being harassed by the sexiest man of the year-',
        movieDetail: 'Film: Mi piacciono molto i film emozionanti e atmosferici con una storia forte e una colonna sonora fantastica.',
        translateLabel: 'Traduci',
        footerText: '🌙 Creato da Kurayami · 2026'
    },
    ja: {
        pageTitle: '私のウェブサイト',
        closeLabel: '閉じる',
        welcome: '私のウェブサイトへようこそ',
        tvCategoriesLabel: 'テレビカテゴリ',
        drawingEnableLabel: '描画モードを有効にする',
        drawingDisableLabel: '描画モードを無効にする',
        weatherAriaLabel: '好きな天気を表示',
        foodAriaLabel: '好きな食べ物を表示',
        colorAriaLabel: '好きな色を表示',
        rainCloudLabel: '雨雲',
        ramenLabel: 'ラーメン',
        purpleLabel: '紫',
        aboutTitle: '自己紹介',
        hi: 'こんにちは :3',
        aboutText: '私の名前はくらやみで、目標はITスペシャリストになることです。<br>その後、サイバーセキュリティの分野へ進みます。<br><br>現在20歳で、このサイトは私の最初のプロジェクトです。<br>それは私とともに成長し続けます。たまに見に来てください。<br><br>このページでは、私の趣味、音楽、プロジェクト、旅行先を見つけることができます。<br>ぜひサイトを見てみてください。',
        hobbiesTitle: '私の趣味',
        gamesLabel: 'ゲーム',
        musicLabel: '音楽',
        booksLabel: '本',
        unlockedDetailsTitle: '解放された詳細',
        favoriteWeather: '好きな天気',
        favoriteFood: '好きな食べ物',
        favoriteColor: '好きな色',
        favoriteWeatherValue: '雷雨',
        favoriteFoodValue: 'ラーメン',
        favoriteColorValue: '濃い紫',
        colorMessageLeft: '世界を紫に染めよう',
        colorDefinition: '紫<br>知恵、直感、思索、創造性と結びついた高貴な色です。',
        paintDescription: '絵を描くことは私のもう一つの趣味です。最初は紙に描き、その後デジタルで描きます。<br>特に天使、悪魔、堕天使、混合生物など、翼を持つ神話上の存在に興味があります。<br>普通の絵だけでなく、さまざまなデザインやグラフィティを使った手作りのオリジナルステッカーも作ります。<br>ウェブサイトにハートを描いてみてください。',
        projectsTitle: 'プロジェクト',
        plannedProjects: '予定中のプロジェクト',
        ongoingProjects: '進行中のプロジェクト',
        completedProjects: '完了したプロジェクト',
        plannedProjectsText: 'シムズCCの変更\nHomelab：ネットワーク、Linux、サーバー',
        ongoingProjectsText: '私のウェブサイト',
        completedProjectsText: 'なし',
        contactTitle: 'お問い合わせ',
        destinationsTitle: '旅行先',
        emailLabel: 'メール',
        discordLabel: 'Discord',
        gamesText: '私は6歳で本格的にゲームを始めました。<br>主にXbox 360でTerrariaとMinecraftをプレイしていました。<br>ゲームキューブでは、Simpsons、Mario Kart、Ice Age、Lego Star Warsも遊びました。<br><br>時々はGame Boyでも遊んでいました。<br><br>クリスマスには何年にもわたってWiiとPSPをもらいました。そこでAvatarとThe Simsをよくプレイしました。<br>WiiではGo Vacation、Mario Kart、WII Party、Animal Crossingも遊びました。<br><br>12歳のときにXbox One Sを買い、そこで一番好きなゲームはOverwatchで、今でも愛しています。<br>Dauntless、Fortnite、Sea of Thieves、Dead by Daylightもよく遊びました。<br>また、他の協力プレイやくつろぎ系ゲームもしました。<br><br>時間が経つと、フリマでDSも買いました。<br>18歳でPCを買い、Overwatch、Dead by Daylight、Sims 4<br>だけでなくWhere Winds Meet、Arc Raidersなどのくつろぎ系ゲームも遊んでいます。<br><br>18歳の終わりにはSwitchも買い、Animal Crossing、Zelda: Breath of the Wild、<br>Stardew Valleyをプレイしています。',
        gamesIntro: '私の好きなゲームの一覧です。好み順に並べています：',
        favoritesLabel: 'ランキング順の好きなゲーム：',
        musicText: 'ここでは私のSpotifyプレイリストを見つけられます。<br>ヒント：ブラウザでSpotifyにログインすると、曲をフルで聴くことができます。<br><br>私はピアノを弾き、現在はルドヴィコ・エイナウディの作品に集中しています。<br>将来は自分の曲も作って公開したいと思っています。<br><br>',
        bookText: '残念ながら本を読む時間はあまりありませんが、時間があるときはここで好きな本を見つけられます。<br><br>私の一番好きな本の一つで、さらに続編も読む予定の本はTintenherzです。<br>4巻の三部作があります。<br>Tintenherz、Tintenblut、Tintentot、そして復讐の色。',
        paintText: '絵画',
        movieLabel: '映画',
        seriesLabel: 'ドラマ',
        animeLabel: 'アニメ',
        movieText: 'Thrash<br> Cardo Lake<br> World War Z<br> Day Shift<br> Bird Box<br> The Last House<br> Nirgendwo<br> Damsel<br> Troll<br> Die Rettung der uns bekannten Welt<br> Ugly<br> Twisters<br> ziemlich betse Freunde<br> They see you<br> Der Gesang der Flusskrebse<br> Veronica<br> ヒックとドラゴン (1、2、3)<br> Avatar - Aufbruch nach Pandora<br> Avatar: The Way of Water<br> Avatar: Fire and Ash<br> ハリー・ポッター<br> ロード・オブ・ザ・リング',
        seriesText: 'Shadowhunters<br> Avatar der Herr der Elemente<br> Dragons auf zu neuen Ufern<br> The Witcher<br> Locke & Key<br> Outer Banks<br> Outlander<br> Stranger Things',
        animeText: 'KPOP Demon Hunters<br> Arcane<br> Demon Slayer<br> JUjutsu Kaisen<br> Solo Leveling<br> Kuroko`s Basketball<br> Hell`s Paradise<br> Gachiakuta<br> Avatar der Herr der Elemente<br> Atelier of Witch Had<br> Die Tagebücher der Apothekerin<br> Food Wars! Shokugeki no soma<br> Haikyuu!<br> Sword Art Online<br> Darling in the FRANXX<br> Campfire cooking in another world with my absurd skill<br> Solo camping for two<br> Violet Evergarden<br> Der Prinz der Drachen der geheimnisvolle Aaravos<br> Suzume<br> Rick and Morty<br> The witcher sirens of the deep<br> Free! - Iwatobi swim club<br> Der Sommer in dem Hikaru starb<br> Given<br> Yuri!!! on ICE<br> Cherry Magic! Thrity years of virginity make you a wizard?!<br> Dakaichi - I`m being harassed by the sexiest man of the year-',
        movieDetail: '映画：私は、強いストーリーと素敵なサウンドトラックを持つ、刺激的で雰囲気のある映画が好きです。',
        translateLabel: '翻訳',
        footerText: '🌙 Kurayami作 · 2026'
    }
};

let currentLanguage = 'de';
let selectedLocation = null;
let selectedHobbyIcon = null;

function updateTVTexts(language) {
    const selected = getTranslations(language);
    document.querySelectorAll('.tv-subcategory-btn').forEach((button) => {
        const key = button.dataset.detailKey;
        if (selected[key]) {
            button.dataset.text = selected[key];
        }
        const labelKey = button.dataset.i18n;
        if (selected[labelKey]) {
            button.textContent = selected[labelKey];
        }
    });

    const activeButton = document.querySelector('.tv-subcategory-btn.active') || document.querySelector('.tv-subcategory-btn');
    const detailBox = document.querySelector('.tv-detail');
    if (activeButton && detailBox) {
        detailBox.textContent = activeButton.dataset.text || selected.movieDetail;
    }
}

function applyTranslations(language = 'de') {
    const selected = getTranslations(language);
    currentLanguage = language;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;
        if (selected[key]) {
            element.textContent = selected[key];
        }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
        const key = element.dataset.i18nAria;
        if (selected[key]) {
            element.setAttribute('aria-label', selected[key]);
        }
    });

    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
        const key = element.dataset.i18nHtml;
        if (selected[key]) {
            element.innerHTML = selected[key];
        }
    });

    const aboutText = document.querySelector('[data-i18n-html="aboutText"]');
    if (aboutText && selected.aboutText) {
        aboutText.innerHTML = selected.aboutText;
    }

    updateTVTexts(language);
    updateProjectTexts(language);

    if (selectedLocation) {
        updateLocationInfo(selectedLocation);
    }

    const hobbyDisplay = document.getElementById('hobby-display');
    if (selectedHobbyIcon && hobbyDisplay?.classList.contains('active')) {
        hobbyDisplay.dataset.currentText = '';
        toggleHobby(selectedHobbyIcon);
    }

    const button = document.getElementById('language-button');
    if (button) {
        button.textContent = selected.translateLabel;
    }
}

const germanHtmlTranslations = {};
const germanTextTranslations = {};

document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    germanHtmlTranslations[element.dataset.i18nHtml] = element.innerHTML;
});

document.querySelectorAll('[data-i18n]').forEach((element) => {
    germanTextTranslations[element.dataset.i18n] = element.textContent;
});

function getTranslations(language) {
    const selected = translations[language] || translations.de;
    if (language !== 'de') return selected;

    return {
        ...selected,
        ...germanHtmlTranslations,
        ...germanTextTranslations
    };
}

const languageButton = document.getElementById('language-button');
const languageMenu = document.getElementById('lang-menu');

if (languageButton && languageMenu) {
    languageButton.addEventListener('click', () => {
        const isHidden = languageMenu.hasAttribute('hidden');
        languageMenu.toggleAttribute('hidden', !isHidden);
        languageButton.setAttribute('aria-expanded', String(!isHidden));
    });

    languageMenu.querySelectorAll('.lang-option').forEach((option) => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang || 'de';
            applyTranslations(lang);
            languageMenu.setAttribute('hidden', 'hidden');
            languageButton.setAttribute('aria-expanded', 'false');
        });
    });
}

applyTranslations('de');

// Typewriter-Effekt Funktion mit HTML-Struktur Erhaltung
function typewriterEffect(element, htmlContent, speed = 50) {
    element.innerHTML = '';
    let index = 0;
    let currentHTML = '';
    
    // Parse HTML um Zeichen und Tags korrekt zu behandeln
    function type() {
        let visibleCharacters = 0;

        while (index < htmlContent.length && visibleCharacters < 2) {
            const char = htmlContent.charAt(index);
            
            // Prüfe auf Tag-Start
            if (char === '<') {
                // Finde das Ende des Tags
                let tagEnd = htmlContent.indexOf('>', index);
                if (tagEnd !== -1) {
                    const tag = htmlContent.substring(index, tagEnd + 1);
                    currentHTML += tag;
                    index = tagEnd + 1;
                } else {
                    currentHTML += char;
                    index++;
                }
            } else {
                currentHTML += char;
                index++;
                visibleCharacters++;
            }
        }

        if (visibleCharacters > 0 || index < htmlContent.length) {
            element.innerHTML = currentHTML;
            setTimeout(type, speed);
        }
    }
    
    type();
}

function setupProjectButtons() {
    const display = document.getElementById('projekt-display');
    const buttons = document.querySelectorAll('.projekt-subcategory-btn');
    if (!display || !buttons.length) return;

    function showProjectText(button) {
        if (display.classList.contains('active') && display.dataset.currentButton === button.dataset.category) {
            display.classList.remove('active');
            display.innerHTML = '';
            display.dataset.currentButton = '';
            button.classList.remove('active');
            return;
        }

        buttons.forEach((projectButton) => {
            projectButton.classList.toggle('active', projectButton === button);
        });

        display.innerHTML = '';
        display.classList.add('active');
        display.dataset.currentButton = button.dataset.category;
        const textElement = document.createElement('div');
        textElement.style.whiteSpace = 'pre-line';
        display.appendChild(textElement);
        typewriterEffect(textElement, button.dataset.text || '', 0.5);
    }

    buttons.forEach((button) => {
        button.addEventListener('click', () => showProjectText(button));
    });

}

function updateProjectTexts(language) {
    const selected = getTranslations(language);
    document.querySelectorAll('.projekt-subcategory-btn').forEach((button) => {
        const labelKey = button.dataset.i18n;
        const textKey = button.dataset.textKey;
        if (selected[labelKey]) button.textContent = selected[labelKey];
        if (selected[textKey]) button.dataset.text = selected[textKey];
    });

    const display = document.getElementById('projekt-display');
    const activeButton = document.querySelector('.projekt-subcategory-btn.active');
    if (display?.classList.contains('active') && activeButton) {
        display.dataset.currentText = '';
        activeButton.click();
        activeButton.click();
    }
}

setupProjectButtons();

//Filme / Serien / Animes



// Funktion zum Umschalten der Hobbies

function toggleHobby(clickedIcon) {
    const display = document.getElementById('hobby-display');
    const box = clickedIcon.parentElement;
    const games = box.querySelector('.spiele-liste');
    const books = box.querySelector('.bücher-liste');
    const currentText = box.querySelector('.hobby-text');
    const spotifyPlayer = box.querySelector('iframe.spotify-player');
    const tvButtons = box.querySelectorAll('.tv-subcategory-btn');
    const hobbyButtons = box.querySelectorAll('.hobby-subcategory-btn');
    let activeTvText = '';

    // Sammle den HTML-Inhalt OHNE Spotify-Player
    let completeHtml = '';
    
    if (currentText && !hobbyButtons.length) {
        completeHtml += currentText.innerHTML.trim();
    }

    if (hobbyButtons.length) {
        completeHtml += '<div class="hobby-subcategories">' + Array.from(hobbyButtons).map(button => `<button class="hobby-subcategory-btn ${button.classList.contains('active') ? 'active' : ''}" type="button" data-category="${button.dataset.category}">${button.textContent.trim()}</button>`).join('') + '</div>';
        let hobbyDetailHtml = currentText?.innerHTML.trim() || '';
        if (books) hobbyDetailHtml += '<div class="spiele-wrapper">' + books.innerHTML.trim() + '</div>';
        if (games) hobbyDetailHtml += '<div class="spiele-wrapper">' + games.innerHTML.trim() + '</div>';
        completeHtml += '<div class="tv-detail hobby-detail">' + hobbyDetailHtml + '</div>';
    }
    
    if (tvButtons.length) {
        completeHtml += '<div class="tv-subcategories">' + Array.from(tvButtons).map(button => `<button class="tv-subcategory-btn ${button.classList.contains('active') ? 'active' : ''}" type="button" data-category="${button.dataset.category}" data-text="${button.dataset.text}">${button.textContent.trim()}</button>`).join('') + '</div>';
        activeTvText = box.querySelector('.tv-subcategory-btn.active')?.dataset.text || '';
        if (activeTvText) completeHtml += '<div class="tv-detail">' + activeTvText + '</div>';
    }
    
    // Prüfe, ob bereits der gleiche Inhalt angezeigt wird
    if (display.classList.contains('active') && display.dataset.currentText === completeHtml) {
        display.classList.remove('active');
        display.innerHTML = '';
        display.dataset.currentText = '';
        selectedHobbyIcon = null;
        return;
    }

    selectedHobbyIcon = clickedIcon;
    display.innerHTML = '';
    display.dataset.currentText = completeHtml;
    display.classList.add('active');

    // TV-Unterkategorien sofort anzeigen und nur den Detailtext animieren.
    if (tvButtons.length) {
        display.innerHTML = completeHtml;
        const detailBox = display.querySelector('.tv-detail');
        if (detailBox) {
            typewriterEffect(detailBox, activeTvText, 0.5);
        }
    } else if (completeHtml) {
        const textElement = document.createElement('div');
        display.appendChild(textElement);
        typewriterEffect(textElement, completeHtml, 0.5);
    }

    // Füge Spotify-Player OHNE Animation hinzu
    if (spotifyPlayer) {
        const spotifyContainer = document.createElement('div');
        spotifyContainer.innerHTML = spotifyPlayer.outerHTML;
        display.appendChild(spotifyContainer);
    }

    display.onclick = (event) => {
        const button = event.target.closest('.tv-subcategory-btn, .hobby-subcategory-btn');
        if (!button || !display.contains(button)) return;

        if (button.classList.contains('active')) {
            display.classList.remove('active');
            display.innerHTML = '';
            display.dataset.currentText = '';
            selectedHobbyIcon = null;
            return;
        }

        let detailText = button.dataset.text || currentText?.innerHTML.trim() || '';
        if (button.classList.contains('hobby-subcategory-btn')) {
            if (books) detailText += '<div class="spiele-wrapper">' + books.innerHTML.trim() + '</div>';
            if (games) detailText += '<div class="spiele-wrapper">' + games.innerHTML.trim() + '</div>';
        }
        display.querySelectorAll('.tv-subcategory-btn, .hobby-subcategory-btn').forEach((btn) => {
            btn.classList.toggle('active', btn === button);
        });

        const detailBox = display.querySelector('.tv-detail');
        if (detailBox) {
            typewriterEffect(detailBox, detailText, 0.5);
        }
    };
}

// Setzt die Breite der Hobby-Textbox so, dass sie genau der Breite
// der Icon-Zeile entspricht. Wird beim Laden und beim Größenwechsel aufgerufen.
function updateHobbyDisplayWidth() {
    const hobbies = document.querySelector('.hobbies');
    const display = document.getElementById('hobby-display');
    if (!hobbies || !display) return;

    const rect = hobbies.getBoundingClientRect();
    // Setze explizite Pixel-Breite und zentriere die Box
    display.style.width = Math.round(rect.width) + 'px';
    display.style.marginLeft = 'auto';
    display.style.marginRight = 'auto';
}

// Event-Handler anfügen
document.addEventListener('DOMContentLoaded', updateHobbyDisplayWidth);
window.addEventListener('resize', updateHobbyDisplayWidth);

// Optional: Breite aktualisieren, wenn Icons dynamisch geändert werden
new ResizeObserver(updateHobbyDisplayWidth).observe(document.querySelector('.hobbies'));

// Animierte Lila Marker
const map = L.map('map', {
    minZoom: 2,
    maxZoom: 19,
    zoomSnap: 0.5,
    worldCopyJump: false,
    maxBounds: [[-85.0511, -180], [85.0511, 180]],
    maxBoundsViscosity: 1.0
}).setView([20.0, 0.0], 2.5);

L.tileLayer(`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_31pn_1_f3c64679e4dc61abb22e5842`, {
    attribution: `&copy; OpenStreetmap &copy; CARTO`,
    noWrap: true
}).addTo(map);

// lila Marker mit Animation
function createPurpleMarker() {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="purple-marker">
                <div class="marker-glow"></div>
                <div class="marker-dot"></div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

// Beispielkoordinaten für die Marker
const locations = [
    {
        name: "China, Zhangjiajie",
        coords: [29.1171, 110.4792],
        image: "images/Zhangjiajie China.webp",
        text: "Zhangjiajie in China ist bekannt für seine beeindruckenden Sandsteinpfeiler und die einzigartige Berglandschaft.",
        translations: {
            de: {
                name: "China, Zhangjiajie",
                text: "Zhangjiajie in China ist bekannt für seine beeindruckenden Sandsteinpfeiler und die einzigartige Berglandschaft."
            },
            en: {
                name: "China, Zhangjiajie",
                text: "Zhangjiajie in China is known for its impressive sandstone pillars and unique mountain landscape."
            },
            fr: {
                name: "Chine, Zhangjiajie",
                text: "Zhangjiajie, en Chine, est connu pour ses impressionnants piliers de grès et son paysage montagneux unique."
            },
            es: {
                name: "China, Zhangjiajie",
                text: "Zhangjiajie, en China, es conocido por sus impresionantes pilares de arenisca y su paisaje montañoso único."
            },
            it: {
                name: "Cina, Zhangjiajie",
                text: "Zhangjiajie, in Cina, è famoso per i suoi impressionanti pilastri di arenaria e il suo paesaggio montuoso unico."
            },
            ja: {
                name: "中国・張家界",
                text: "中国の張家界は、壮大な砂岩の柱と独特な山岳風景で知られています。"
            }
        }
    },

    {
        name: "Bolivien, Salar de Uyuni",
        coords: [-20.1338, -66.4892],
        image: "images/Salar de uyuni Bolivia.webp",
        text: "Der Salar de Uyuni in Bolivien ist die größte Salzpfanne der Welt und verwandelt sich bei Regen in einen beeindruckenden Spiegel.",
        translations: {
            de: {
                name: "Bolivien, Salar de Uyuni",
                text: "Der Salar de Uyuni in Bolivien ist die größte Salzpfanne der Welt und verwandelt sich bei Regen in einen beeindruckenden Spiegel."
            },
            en: {
                name: "Bolivia, Salar de Uyuni",
                text: "The Salar de Uyuni in Bolivia is the world's largest salt flat and transforms into an impressive mirror after rain."
            },
            fr: {
                name: "Bolivie, Salar de Uyuni",
                text: "Le Salar d'Uyuni en Bolivie est le plus grand désert de sel du monde et se transforme en un miroir impressionnant lorsqu'il pleut."
            },
            es: {
                name: "Bolivia, Salar de Uyuni",
                text: "El Salar de Uyuni, en Bolivia, es el mayor salar del mundo y se transforma en un impresionante espejo cuando llueve."
            },
            it: {
                name: "Bolivia, Salar de Uyuni",
                text: "Il Salar de Uyuni in Bolivia è la più grande distesa di sale del mondo e dopo la pioggia si trasforma in uno spettacolare specchio."
            },
            ja: {
                name: "ボリビア・ウユニ塩湖",
                text: "ボリビアのウユニ塩湖は世界最大の塩原で、雨が降ると美しい巨大な鏡のような景色になります。"
            }
        }
    },

    {
        name: "Malediven, Sea of Stars",
        coords: [4.1748, 73.5093],
        image: "images/Sea of Stars maldives.jpg",
        text: "Auf den Malediven leuchten winzige Meeresorganismen nachts im Wasser und erzeugen den magischen Anblick des Sea of Stars.",
        translations: {
            de: {
                name: "Malediven, Sea of Stars",
                text: "Auf den Malediven leuchten winzige Meeresorganismen nachts im Wasser und erzeugen den magischen Anblick des Sea of Stars."
            },
            en: {
                name: "Maldives, Sea of Stars",
                text: "In the Maldives, tiny marine organisms glow in the water at night, creating the magical sight known as the Sea of Stars."
            },
            fr: {
                name: "Maldives, Sea of Stars",
                text: "Aux Maldives, de minuscules organismes marins brillent dans l'eau la nuit, créant le spectacle magique du Sea of Stars."
            },
            es: {
                name: "Maldivas, Sea of Stars",
                text: "En las Maldivas, diminutos organismos marinos brillan en el agua durante la noche, creando el mágico espectáculo del Sea of Stars."
            },
            it: {
                name: "Maldive, Sea of Stars",
                text: "Alle Maldive, minuscoli organismi marini brillano nell'acqua durante la notte, creando il magico spettacolo del Sea of Stars."
            },
            ja: {
                name: "モルディブ・Sea of Stars",
                text: "モルディブでは、夜になると小さな海洋生物が水中で光り、Sea of Starsと呼ばれる幻想的な景色を作り出します。"
            }
        }
    },

    {
        name: "Norwegen, Nordlichter",
        coords: [69.6492, 18.9553],
        image: "images/polarlichter norwegen.webp",
        text: "Rund um Tromsø in Nordnorwegen kann man mit etwas Glück farbenprächtige Nordlichter am Nachthimmel beobachten.",
        translations: {
            de: {
                name: "Norwegen, Nordlichter",
                text: "Rund um Tromsø in Nordnorwegen kann man mit etwas Glück farbenprächtige Nordlichter am Nachthimmel beobachten."
            },
            en: {
                name: "Norway, Northern Lights",
                text: "Around Tromsø in northern Norway, you can sometimes see colorful Northern Lights dancing across the night sky."
            },
            fr: {
                name: "Norvège, aurores boréales",
                text: "Autour de Tromsø, dans le nord de la Norvège, on peut parfois observer de magnifiques aurores boréales colorées dans le ciel nocturne."
            },
            es: {
                name: "Noruega, auroras boreales",
                text: "Alrededor de Tromsø, en el norte de Noruega, con un poco de suerte se pueden observar coloridas auroras boreales en el cielo nocturno."
            },
            it: {
                name: "Norvegia, aurora boreale",
                text: "Nei dintorni di Tromsø, nel nord della Norvegia, con un po' di fortuna è possibile osservare le colorate aurore boreali nel cielo notturno."
            },
            ja: {
                name: "ノルウェー・オーロラ",
                text: "ノルウェー北部のトロムソ周辺では、運が良ければ夜空に美しい色とりどりのオーロラを見ることができます。"
            }
        }
    },

    {
        name: "Hawaii",
        coords: [21.3069, -157.8583],
        image: "images/hawaii.jpg",
        text: "Hawaii verbindet tropische Strände, vulkanische Landschaften und eine lebendige Kultur mitten im Pazifik.",
        translations: {
            de: {
                name: "Hawaii",
                text: "Hawaii verbindet tropische Strände, vulkanische Landschaften und eine lebendige Kultur mitten im Pazifik."
            },
            en: {
                name: "Hawaii",
                text: "Hawaii combines tropical beaches, volcanic landscapes and a vibrant culture in the middle of the Pacific."
            },
            fr: {
                name: "Hawaï",
                text: "Hawaï réunit des plages tropicales, des paysages volcaniques et une culture vivante au cœur du Pacifique."
            },
            es: {
                name: "Hawái",
                text: "Hawái combina playas tropicales, paisajes volcánicos y una cultura vibrante en medio del Pacífico."
            },
            it: {
                name: "Hawaii",
                text: "Le Hawaii combinano spiagge tropicali, paesaggi vulcanici e una cultura vivace nel cuore dell'Oceano Pacifico."
            },
            ja: {
                name: "ハワイ",
                text: "ハワイは、太平洋の中心で熱帯のビーチ、火山の景観、そして豊かな文化を楽しめる場所です。"
            }
        }
    },

    {
        name: "Indonesien, Pink Beach",
        coords: [-8.6571, 119.5431],
        image: "images/pink beach indonesien.jpg",
        text: "Der Pink Beach auf Komodo erhält seine ungewöhnliche Farbe durch winzige rote Korallenstücke, die sich mit dem Sand vermischen.",
        translations: {
            de: {
                name: "Indonesien, Pink Beach",
                text: "Der Pink Beach auf Komodo erhält seine ungewöhnliche Farbe durch winzige rote Korallenstücke, die sich mit dem Sand vermischen."
            },
            en: {
                name: "Indonesia, Pink Beach",
                text: "Pink Beach on Komodo gets its unusual color from tiny red coral fragments that mix with the sand."
            },
            fr: {
                name: "Indonésie, Pink Beach",
                text: "Le Pink Beach de Komodo doit sa couleur inhabituelle à de minuscules fragments de corail rouge qui se mélangent au sable."
            },
            es: {
                name: "Indonesia, Pink Beach",
                text: "Pink Beach, en Komodo, obtiene su color inusual gracias a diminutos fragmentos de coral rojo que se mezclan con la arena."
            },
            it: {
                name: "Indonesia, Pink Beach",
                text: "La Pink Beach di Komodo deve il suo colore insolito a minuscoli frammenti di corallo rosso che si mescolano alla sabbia."
            },
            ja: {
                name: "インドネシア・ピンクビーチ",
                text: "コモド島のピンクビーチは、赤いサンゴの小さな欠片が砂に混ざることで独特のピンク色になります。"
            }
        }
    },

    {
        name: "Indonesien, Bali",
        coords: [-8.4095, 115.1889],
        image: "images/bali indonesien.jpg",
        text: "Bali ist bekannt für Reisterrassen, tropische Strände, hinduistische Tempel und seine besondere Kunst- und Esskultur.",
        translations: {
            de: {
                name: "Indonesien, Bali",
                text: "Bali ist bekannt für Reisterrassen, tropische Strände, hinduistische Tempel und seine besondere Kunst- und Esskultur."
            },
            en: {
                name: "Indonesia, Bali",
                text: "Bali is known for its rice terraces, tropical beaches, Hindu temples and distinctive art and food culture."
            },
            fr: {
                name: "Indonésie, Bali",
                text: "Bali est connue pour ses rizières en terrasses, ses plages tropicales, ses temples hindous et sa culture artistique et culinaire particulière."
            },
            es: {
                name: "Indonesia, Bali",
                text: "Bali es conocida por sus arrozales en terrazas, playas tropicales, templos hindúes y su particular cultura artística y gastronómica."
            },
            it: {
                name: "Indonesia, Bali",
                text: "Bali è famosa per le sue risaie terrazzate, le spiagge tropicali, i templi indù e la sua particolare cultura artistica e culinaria."
            },
            ja: {
                name: "インドネシア・バリ島",
                text: "バリ島は、棚田、熱帯のビーチ、ヒンドゥー教寺院、そして独特の芸術と食文化で知られています。"
            }
        }
    },

    {
        name: "Chile, Marble Caves",
        coords: [-46.6467, -72.6259],
        image: "images/marble caves chile.jpg",
        text: "Die Marble Caves in Chile sind von Wasser geformte Marmorfelsen im türkisfarbenen Lago General Carrera.",
        translations: {
            de: {
                name: "Chile, Marble Caves",
                text: "Die Marble Caves in Chile sind von Wasser geformte Marmorfelsen im türkisfarbenen Lago General Carrera."
            },
            en: {
                name: "Chile, Marble Caves",
                text: "The Marble Caves in Chile are marble rock formations shaped by water in the turquoise waters of General Carrera Lake."
            },
            fr: {
                name: "Chili, Marble Caves",
                text: "Les Marble Caves du Chili sont des formations rocheuses en marbre sculptées par l'eau dans les eaux turquoise du lac General Carrera."
            },
            es: {
                name: "Chile, Marble Caves",
                text: "Las Marble Caves de Chile son formaciones de mármol moldeadas por el agua en las aguas turquesas del lago General Carrera."
            },
            it: {
                name: "Cile, Marble Caves",
                text: "Le Marble Caves in Cile sono formazioni di marmo modellate dall'acqua nelle acque turchesi del lago General Carrera."
            },
            ja: {
                name: "チリ・マーブルケーブ",
                text: "チリのマーブルケーブは、ターコイズブルーのヘネラル・カレーラ湖にある、水によって形作られた大理石の岩石群です。"
            }
        }
    },

    {
        name: "Japan, Kirchblüten Zeit",
        coords: [35.0116, 135.7681],
        image: "images/sakura time japan.jpeg",
        text: "Im japanischen Frühling verwandeln Kirschblüten Parks und Tempelanlagen in ein zartrosa Blütenmeer.",
        translations: {
            de: {
                name: "Japan, Kirschblütenzeit",
                text: "Im japanischen Frühling verwandeln Kirschblüten Parks und Tempelanlagen in ein zartrosa Blütenmeer."
            },
            en: {
                name: "Japan, Cherry Blossom Season",
                text: "In spring, cherry blossoms transform parks and temple grounds across Japan into a delicate sea of pink."
            },
            fr: {
                name: "Japon, saison des cerisiers en fleurs",
                text: "Au printemps japonais, les cerisiers en fleurs transforment les parcs et les temples en une délicate mer rose."
            },
            es: {
                name: "Japón, temporada de sakura",
                text: "En la primavera japonesa, los cerezos en flor convierten parques y templos en un delicado mar de color rosa."
            },
            it: {
                name: "Giappone, stagione dei ciliegi in fiore",
                text: "In primavera, i ciliegi in fiore trasformano i parchi e i templi del Giappone in un delicato mare rosa."
            },
            ja: {
                name: "日本・桜の季節",
                text: "日本の春には、桜の花が公園や寺院を淡いピンク色の美しい花景色に変えます。"
            }
        }
    },

    {
        name: "Madeira",
        coords: [32.7607, -16.9595],
        image: "images/madeira.webp",
        text: "Madeira ist eine portugiesische Atlantikinsel mit grünen Levadas, steilen Bergen und einer abwechslungsreichen Küste.",
        translations: {
            de: {
                name: "Madeira",
                text: "Madeira ist eine portugiesische Atlantikinsel mit grünen Levadas, steilen Bergen und einer abwechslungsreichen Küste."
            },
            en: {
                name: "Madeira",
                text: "Madeira is a Portuguese Atlantic island with green levadas, steep mountains and a varied coastline."
            },
            fr: {
                name: "Madère",
                text: "Madère est une île portugaise de l'Atlantique connue pour ses levadas verdoyantes, ses montagnes escarpées et son littoral varié."
            },
            es: {
                name: "Madeira",
                text: "Madeira es una isla portuguesa del Atlántico con verdes levadas, montañas escarpadas y una costa variada."
            },
            it: {
                name: "Madeira",
                text: "Madeira è un'isola portoghese dell'Atlantico con verdi levadas, montagne scoscese e una costa variegata."
            },
            ja: {
                name: "マデイラ島",
                text: "マデイラ島は、緑豊かなレバダ、険しい山々、多様な海岸線を持つポルトガルの大西洋の島です。"
            }
        }
    },

    {
        name: "Kasachstan, Pink Lake",
        coords: [51.5368, 75.3105],
        image: "images/pink lake kazachstan.jpeg",
        text: "Der Kobeytuz-See in Kasachstan kann durch salzliebende Mikroorganismen eine auffällige rosa Färbung annehmen.",
        translations: {
            de: {
                name: "Kasachstan, Pink Lake",
                text: "Der Kobeytuz-See in Kasachstan kann durch salzliebende Mikroorganismen eine auffällige rosa Färbung annehmen."
            },
            en: {
                name: "Kazakhstan, Pink Lake",
                text: "Lake Kobeytuz in Kazakhstan can develop a striking pink color due to salt-loving microorganisms."
            },
            fr: {
                name: "Kazakhstan, Pink Lake",
                text: "Le lac Kobeytuz au Kazakhstan peut prendre une couleur rose remarquable grâce à des micro-organismes qui aiment le sel."
            },
            es: {
                name: "Kazajistán, Pink Lake",
                text: "El lago Kobeytuz, en Kazajistán, puede adquirir un llamativo color rosa debido a microorganismos amantes de la sal."
            },
            it: {
                name: "Kazakistan, Pink Lake",
                text: "Il lago Kobeytuz in Kazakistan può assumere una caratteristica colorazione rosa a causa di microrganismi che amano il sale."
            },
            ja: {
                name: "カザフスタン・ピンクレイク",
                text: "カザフスタンのコベイトゥズ湖は、塩を好む微生物によって鮮やかなピンク色になることがあります。"
            }
        }
    },

    {
        name: "Island, Reynisfjara Beach",
        coords: [63.4048, -19.0448],
        image: "images/reynisfjara beach irland.jpg",
        text: "Reynisfjara ist ein schwarzer Vulkanstrand an Islands Südküste mit beeindruckenden Basaltsäulen und wilden Wellen.",
        translations: {
            de: {
                name: "Island, Reynisfjara Beach",
                text: "Reynisfjara ist ein schwarzer Vulkanstrand an Islands Südküste mit beeindruckenden Basaltsäulen und wilden Wellen."
            },
            en: {
                name: "Iceland, Reynisfjara Beach",
                text: "Reynisfjara is a black volcanic beach on Iceland's southern coast with impressive basalt columns and powerful waves."
            },
            fr: {
                name: "Islande, plage de Reynisfjara",
                text: "Reynisfjara est une plage volcanique noire située sur la côte sud de l'Islande, avec d'impressionnantes colonnes de basalte et de puissantes vagues."
            },
            es: {
                name: "Islandia, playa de Reynisfjara",
                text: "Reynisfjara es una playa volcánica negra en la costa sur de Islandia, con impresionantes columnas de basalto y fuertes olas."
            },
            it: {
                name: "Islanda, spiaggia di Reynisfjara",
                text: "Reynisfjara è una spiaggia vulcanica nera sulla costa meridionale dell'Islanda, con impressionanti colonne di basalto e onde impetuose."
            },
            ja: {
                name: "アイスランド・レイニスフィヤラ",
                text: "レイニスフィヤラはアイスランド南海岸にある黒い火山砂浜で、壮大な玄武岩の柱と荒々しい波が特徴です。"
            }
        }
    },

    {
        name: "New York, Weihnachten",
        coords: [40.7128, -74.0060],
        image: "images/christmas new york.jpg",
        text: "New York ist zur Weihnachtszeit für festlich geschmückte Schaufenster, Lichter und den großen Baum am Rockefeller Center bekannt.",
        translations: {
            de: {
                name: "New York, Weihnachten",
                text: "New York ist zur Weihnachtszeit für festlich geschmückte Schaufenster, Lichter und den großen Baum am Rockefeller Center bekannt."
            },
            en: {
                name: "New York, Christmas",
                text: "New York is known during the Christmas season for festive shop windows, lights and the large tree at Rockefeller Center."
            },
            fr: {
                name: "New York, Noël",
                text: "Pendant la période de Noël, New York est connue pour ses vitrines décorées, ses illuminations et le grand sapin du Rockefeller Center."
            },
            es: {
                name: "Nueva York, Navidad",
                text: "Durante la Navidad, Nueva York es conocida por sus escaparates decorados, sus luces y el gran árbol del Rockefeller Center."
            },
            it: {
                name: "New York, Natale",
                text: "Durante il periodo natalizio, New York è famosa per le vetrine decorate, le luci e il grande albero del Rockefeller Center."
            },
            ja: {
                name: "ニューヨーク・クリスマス",
                text: "クリスマスの時期のニューヨークは、華やかに飾られたショーウィンドウやイルミネーション、ロックフェラー・センターの大きなツリーで知られています。"
            }
        }
    },

    {
        name: "Los Angeles",
        coords: [34.0522, -118.2437],
        image: "images/Los-Angeles.jpg",
        text: "Los Angeles verbindet sonnige Strände, Palmen, Filmgeschichte und die weitläufige Landschaft Südkaliforniens.",
        translations: {
            de: {
                name: "Los Angeles",
                text: "Los Angeles verbindet sonnige Strände, Palmen, Filmgeschichte und die weitläufige Landschaft Südkaliforniens."
            },
            en: {
                name: "Los Angeles",
                text: "Los Angeles combines sunny beaches, palm trees, film history and the vast landscapes of Southern California."
            },
            fr: {
                name: "Los Angeles",
                text: "Los Angeles réunit plages ensoleillées, palmiers, histoire du cinéma et vastes paysages de Californie du Sud."
            },
            es: {
                name: "Los Ángeles",
                text: "Los Ángeles combina playas soleadas, palmeras, historia del cine y los extensos paisajes del sur de California."
            },
            it: {
                name: "Los Angeles",
                text: "Los Angeles combina spiagge soleggiate, palme, storia del cinema e gli ampi paesaggi della California meridionale."
            },
            ja: {
                name: "ロサンゼルス",
                text: "ロサンゼルスは、日差しの降り注ぐビーチ、ヤシの木、映画の歴史、そして南カリフォルニアの広大な風景が魅力の都市です。"
            }
        }
    },

    {
        name: "Ägypten, Pyramiden",
        coords: [29.9792, 31.1342],
        image: "images/pyramiden aegypten.webp",
        text: "Die Pyramiden von Gizeh nahe Kairo gehören zu den berühmtesten Bauwerken der Antike und werden von der Sphinx bewacht.",
        translations: {
            de: {
                name: "Ägypten, Pyramiden",
                text: "Die Pyramiden von Gizeh nahe Kairo gehören zu den berühmtesten Bauwerken der Antike und werden von der Sphinx bewacht."
            },
            en: {
                name: "Egypt, Pyramids",
                text: "The Pyramids of Giza near Cairo are among the most famous structures of the ancient world and are guarded by the Sphinx."
            },
            fr: {
                name: "Égypte, pyramides",
                text: "Les pyramides de Gizeh, près du Caire, comptent parmi les monuments les plus célèbres de l'Antiquité et sont gardées par le Sphinx."
            },
            es: {
                name: "Egipto, pirámides",
                text: "Las pirámides de Guiza, cerca de El Cairo, se encuentran entre las construcciones más famosas de la Antigüedad y están custodiadas por la Esfinge."
            },
            it: {
                name: "Egitto, piramidi",
                text: "Le piramidi di Giza, vicino al Cairo, sono tra le costruzioni più famose dell'antichità e sono sorvegliate dalla Sfinge."
            },
            ja: {
                name: "エジプト・ピラミッド",
                text: "カイロ近郊のギザのピラミッドは古代世界で最も有名な建造物の一つで、スフィンクスに守られています。"
            }
        }
    },

    {
        name: "Französisch-Polynesien, Bora Bora",
        coords: [-16.5004, -151.7415],
        image: "images/bora bora france.webp",
        text: "Bora Bora ist eine Insel in Französisch-Polynesien mit einer türkisfarbenen Lagune und einem markanten Vulkanberg.",
        translations: {
            de: {
                name: "Französisch-Polynesien, Bora Bora",
                text: "Bora Bora ist eine Insel in Französisch-Polynesien mit einer türkisfarbenen Lagune und einem markanten Vulkanberg."
            },
            en: {
                name: "French Polynesia, Bora Bora",
                text: "Bora Bora is an island in French Polynesia with a turquoise lagoon and a distinctive volcanic mountain."
            },
            fr: {
                name: "Polynésie française, Bora Bora",
                text: "Bora Bora est une île de Polynésie française avec un lagon turquoise et une impressionnante montagne volcanique."
            },
            es: {
                name: "Polinesia Francesa, Bora Bora",
                text: "Bora Bora es una isla de la Polinesia Francesa con una laguna turquesa y una impresionante montaña volcánica."
            },
            it: {
                name: "Polinesia francese, Bora Bora",
                text: "Bora Bora è un'isola della Polinesia francese con una laguna turchese e una caratteristica montagna vulcanica."
            },
            ja: {
                name: "フランス領ポリネシア・ボラボラ島",
                text: "ボラボラ島はフランス領ポリネシアにある島で、ターコイズブルーのラグーンと特徴的な火山の山があります。"
            }
        }
    },

    {
        name: "Arizona, Antelope Canyon",
        coords: [36.8619, -111.3743],
        image: "images/antelope canyon arizona.jpg",
        text: "Der Antelope Canyon in Arizona ist ein schmaler Slot Canyon, dessen geschwungene Sandsteinwände vom Licht gezeichnet werden.",
        translations: {
            de: {
                name: "Arizona, Antelope Canyon",
                text: "Der Antelope Canyon in Arizona ist ein schmaler Slot Canyon, dessen geschwungene Sandsteinwände vom Licht gezeichnet werden."
            },
            en: {
                name: "Arizona, Antelope Canyon",
                text: "Antelope Canyon in Arizona is a narrow slot canyon whose curved sandstone walls are shaped by light."
            },
            fr: {
                name: "Arizona, Antelope Canyon",
                text: "L'Antelope Canyon en Arizona est un étroit canyon en fente dont les parois de grès ondulées sont sculptées par la lumière."
            },
            es: {
                name: "Arizona, Antelope Canyon",
                text: "El Antelope Canyon, en Arizona, es un estrecho cañón de ranura cuyas paredes curvas de arenisca están moldeadas por la luz."
            },
            it: {
                name: "Arizona, Antelope Canyon",
                text: "L'Antelope Canyon in Arizona è uno stretto canyon caratterizzato da pareti di arenaria sinuose modellate dalla luce."
            },
            ja: {
                name: "アリゾナ・アンテロープキャニオン",
                text: "アリゾナ州のアンテロープキャニオンは、光によって美しく彩られる曲線的な砂岩の壁を持つ細いスロットキャニオンです。"
            }
        }
    },

    {
        name: "Italien",
        coords: [41.9028, 12.4964],
        image: "images/italien.webp",
        text: "Italien vereint antike Geschichte, beeindruckende Kunst, mediterrane Landschaften und eine vielfältige regionale Küche.",
        translations: {
            de: {
                name: "Italien",
                text: "Italien vereint antike Geschichte, beeindruckende Kunst, mediterrane Landschaften und eine vielfältige regionale Küche."
            },
            en: {
                name: "Italy",
                text: "Italy combines ancient history, impressive art, Mediterranean landscapes and a diverse regional cuisine."
            },
            fr: {
                name: "Italie",
                text: "L'Italie réunit une histoire ancienne, un art impressionnant, des paysages méditerranéens et une cuisine régionale variée."
            },
            es: {
                name: "Italia",
                text: "Italia combina historia antigua, arte impresionante, paisajes mediterráneos y una variada gastronomía regional."
            },
            it: {
                name: "Italia",
                text: "L'Italia unisce storia antica, arte straordinaria, paesaggi mediterranei e una cucina regionale molto varia."
            },
            ja: {
                name: "イタリア",
                text: "イタリアは、古代の歴史、素晴らしい芸術、地中海の風景、そして多様な郷土料理が魅力の国です。"
            }
        }
    },

    {
        name: "Afrika, Sahara",
        coords: [23.4162, 25.6628],
        image: "images/Iron-Ore-Train-Mauritinia.jpg",
        text: "Die Sahara ist die größte heiße Wüste der Erde und beeindruckt mit endlosen Dünen, Felslandschaften und klaren Sternennächten.",
        translations: {
            de: {
                name: "Afrika, Sahara",
                text: "Die Sahara ist die größte heiße Wüste der Erde und beeindruckt mit endlosen Dünen, Felslandschaften und klaren Sternennächten."
            },
            en: {
                name: "Africa, Sahara",
                text: "The Sahara is the largest hot desert on Earth and impresses with endless dunes, rocky landscapes and clear starry nights."
            },
            fr: {
                name: "Afrique, Sahara",
                text: "Le Sahara est le plus grand désert chaud de la Terre et impressionne par ses dunes interminables, ses paysages rocheux et ses nuits étoilées."
            },
            es: {
                name: "África, Sahara",
                text: "El Sahara es el mayor desierto cálido de la Tierra y sorprende con sus dunas interminables, paisajes rocosos y noches estrelladas."
            },
            it: {
                name: "Africa, Sahara",
                text: "Il Sahara è il più grande deserto caldo della Terra e affascina con dune infinite, paesaggi rocciosi e notti stellate."
            },
            ja: {
                name: "アフリカ・サハラ砂漠",
                text: "サハラ砂漠は地球最大の暑い砂漠で、果てしなく続く砂丘、岩の大地、澄んだ星空が魅力です。"
            }
        }
    }
];

function updateLocationInfo(location) {
    const localizedLocation = location.translations?.[currentLanguage] || location;
    document.getElementById('location-image').src = location.image;
    document.getElementById('location-title').textContent = localizedLocation.name;
    document.getElementById('location-text').textContent = localizedLocation.text;
}

// Marker hinzufügen
locations.forEach(location => {
    const marker = L.marker(
        location.coords,
        {
            icon: createPurpleMarker()
        }
    ).addTo(map);

    marker.on('click', () => {
        selectedLocation = location;
        updateLocationInfo(location);
        document.getElementById('location-info').classList.add('show');
    });
});

// Schließen-Button für die Infobox
document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('location-info').classList.remove('show');
});
