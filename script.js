// Variables globales
let selectedCategory = '';
let nombrePersonnes = 0;
let dureeJours = 1;
let genre = 'mixte';
let dureeSuperieureA6h = false;
let proportionHommes = 70;

// Fonction pour gérer les erreurs
function logError(error) {
    console.error("Erreur détectée:", error);
}

// Sélection de catégorie
function selectCategory(category, button) {
    selectedCategory = category;

    // Désélectionner tous les boutons
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Sélectionner le bouton cliqué
    button.classList.add('selected');

    // Activer le bouton suivant
    document.getElementById('nextBtn1').classList.remove('btn-disabled');

    // Configurer les options de la page 3 selon la catégorie
    if (category === 'evenementiel') {
        document.getElementById('dureeJoursGroup').style.display = 'none';
        document.getElementById('page3Title').textContent = 'Quelle sera la durée de votre événement ?';
        document.getElementById('dureeEvenementGroup').style.display = 'block';
        document.getElementById('proportionHommesGroup').style.display = 'none';
        document.getElementById('recapDureeJours').style.display = 'none';
        document.getElementById('recapDureeEvent').style.display = 'block';
    } else {
        document.getElementById('dureeJoursGroup').style.display = 'block';
        document.getElementById('page3Title').textContent = 'Préférences supplémentaires';
        document.getElementById('dureeEvenementGroup').style.display = 'none';
        document.getElementById('recapDureeJours').style.display = 'block';
        document.getElementById('recapDureeEvent').style.display = 'none';

        if (category === 'chantier') {
            document.getElementById('proportionHommesGroup').style.display = 'block';
            document.getElementById('recapProportion').style.display = 'block';
        } else {
            document.getElementById('proportionHommesGroup').style.display = 'none';
            document.getElementById('recapProportion').style.display = 'none';
        }
    }
}

function checkPersonnes() {
    nombrePersonnes = parseInt(document.getElementById('nombrePersonnes').value) || 0;

    if (nombrePersonnes > 0) {
        document.getElementById('nextBtn2').classList.remove('btn-disabled');
    } else {
        document.getElementById('nextBtn2').classList.add('btn-disabled');
    }
}

function goToPage(pageNumber) {
    console.log("Navigation vers la page", pageNumber);

    if (pageNumber === 2 && document.getElementById('nextBtn1').classList.contains('btn-disabled')) {
        return;
    }

    if (pageNumber === 3 && document.getElementById('nextBtn2').classList.contains('btn-disabled')) {
        return;
    }

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.getElementById('page' + pageNumber).classList.add('active');

    updateProgressBar(pageNumber);

    if (pageNumber === 3) {
        dureeJours = parseInt(document.getElementById('dureeJours').value) || 1;
    }
}

function updateProgressBar(pageNumber) {
    document.querySelectorAll('.step-number').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelectorAll('.progress-line').forEach(line => {
        line.classList.remove('active');
    });

    for (let i = 1; i <= pageNumber; i++) {
        document.getElementById('step' + i).classList.add('active');
        if (i < pageNumber) {
            document.getElementById('line' + i).classList.add('active');
        }
    }
}

function setGenre(value) {
    genre = value;
}

function setDureeEvenement() {
    dureeSuperieureA6h = document.getElementById('dureeEvenement').value === 'superieur';
}

function updateProportion() {
    proportionHommes = parseInt(document.getElementById('proportionHommes').value);
    document.getElementById('proportionLabel').textContent = 
        proportionHommes + '% hommes, ' + (100 - proportionHommes) + '% femmes';
}

function calculerResultat() {
    console.log("Calcul du résultat...");
    dureeJours = parseInt(document.getElementById('dureeJours').value) || 1;

    let resultat = calculateWC();
    console.log("Résultat calculé:", resultat);

    document.getElementById('resultatWC').textContent = resultat.total;

    if ((selectedCategory === 'chantier' || selectedCategory === 'industrie') && genre === 'separe') {
        document.getElementById('detailsGenre').style.display = 'block';
        document.getElementById('resultHommes').textContent = resultat.hommes;
        document.getElementById('resultFemmes').textContent = resultat.femmes;
    } else {
        document.getElementById('detailsGenre').style.display = 'none';
    }

    const categorieNames = {
        'evenementiel': 'Événementiel',
        'industrie': 'Industrie',
        'chantier': 'Chantiers'
    };

    document.getElementById('recapCategorie').textContent = categorieNames[selectedCategory] || selectedCategory;
    document.getElementById('recapNbPersonnes').textContent = nombrePersonnes;
    document.getElementById('recapGenre').textContent = genre === 'mixte' ? 'WC mixtes' : 'WC séparés H/F';

    if (selectedCategory === 'evenementiel') {
        document.getElementById('recapDureeEventValue').textContent = dureeSuperieureA6h ? 'Supérieure à 6h' : 'Inférieure à 6h';
    } else {
        document.getElementById('recapDureeJoursValue').textContent = dureeJours;
    }

    if (selectedCategory === 'chantier') {
        document.getElementById('recapProportionValue').textContent = proportionHommes + '% hommes, ' + (100 - proportionHommes) + '% femmes';
    }

    goToPage(4);
}

function calculateWC() {
    let nombreWC = 0;
    let detailsHommes = 0;
    let detailsFemmes = 0;

    if (selectedCategory === 'evenementiel') {
        let nombreCabines = 0;

        if (!dureeSuperieureA6h) {
            nombreCabines = Math.ceil(nombrePersonnes / 65);
        } else {
            nombreCabines = Math.ceil(nombrePersonnes / 35);
        }

        nombreWC = Math.max(1, nombreCabines);
    } 
    else if (selectedCategory === 'chantier' || selectedCategory === 'industrie') {
        let propH = selectedCategory === 'industrie' ? 0.5 : proportionHommes / 100;
        let propF = 1 - propH;

        const nbHommes = Math.ceil(nombrePersonnes * propH);
        const nbFemmes = Math.ceil(nombrePersonnes * propF);

        const getCabines = nb => nb <= 7 ? 1 : nb <= 14 ? 2 : nb <= 21 ? 3 : 3 + Math.ceil((nb - 21) / 7);

        let nombreCabinesHommes = getCabines(nbHommes);
        let nombreCabinesFemmes = getCabines(nbFemmes);

        const facteurDuree = selectedCategory === 'industrie'
            ? Math.min(1.5, 1 + (dureeJours / 180))
            : (dureeJours > 30 ? 1.2 : 1);

        nombreCabinesHommes = Math.ceil(nombreCabinesHommes * facteurDuree);
        nombreCabinesFemmes = Math.ceil(nombreCabinesFemmes * facteurDuree);

        if (genre === 'mixte') {
            nombreWC = Math.max(nombreCabinesHommes, nombreCabinesFemmes);
        } else {
            nombreWC = nombreCabinesHommes + nombreCabinesFemmes;
        }

        detailsHommes = nombreCabinesHommes;
        detailsFemmes = nombreCabinesFemmes;
    }

    return {
        total: nombreWC,
        hommes: detailsHommes,
        femmes: detailsFemmes
    };
}

function resetCalculator() {
    selectedCategory = '';
    nombrePersonnes = 0;
    dureeJours = 1;
    genre = 'mixte';
    dureeSuperieureA6h = false;
    proportionHommes = 70;

    document.getElementById('nombrePersonnes').value = '';
    document.getElementById('dureeJours').value = '1';
    document.getElementById('genreMixte').checked = true;
    document.getElementById('genreSepare').checked = false;
    document.getElementById('dureeEvenement').value = 'inferieur';
    document.getElementById('proportionHommes').value = '70';
    document.getElementById('proportionLabel').textContent = '70% hommes, 30% femmes';

    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('selected');
    });

    document.getElementById('nextBtn1').classList.add('btn-disabled');
    document.getElementById('nextBtn2').classList.add('btn-disabled');

    goToPage(1);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function () {
    try {
        document.querySelectorAll('.category-button').forEach(btn => {
            btn.addEventListener('click', function () {
                const category = this.getAttribute('data-category');
                selectCategory(category, this);
            });
        });

        const nextBtn1 = document.getElementById('nextBtn1');
        if (nextBtn1) {
            nextBtn1.addEventListener('click', function () {
                if (!this.classList.contains('btn-disabled')) {
                    goToPage(2);
                }
            });
        }

        const nextBtn2 = document.getElementById('nextBtn2');
        if (nextBtn2) {
            nextBtn2.addEventListener('click', function () {
                if (!this.classList.contains('btn-disabled')) {
                    goToPage(3);
                }
            });
        }

        document.querySelector('#page2 .btn-back').addEventListener('click', () => goToPage(1));
        document.querySelector('#page3 .btn-back').addEventListener('click', () => goToPage(2));
        document.querySelector('#page3 .btn-next').addEventListener('click', calculerResultat);
        document.querySelector('#page4 .btn-back').addEventListener('click', () => goToPage(3));
        document.querySelector('#page4 .btn-next').addEventListener('click', resetCalculator);

        document.getElementById('nombrePersonnes').addEventListener('input', checkPersonnes);
        document.getElementById('dureeEvenement').addEventListener('change', setDureeEvenement);
        document.getElementById('proportionHommes').addEventListener('input', updateProportion);

        document.getElementById('genreMixte').addEventListener('change', () => setGenre('mixte'));
        document.getElementById('genreSepare').addEventListener('change', () => setGenre('separe'));

        goToPage(1);
    } catch (e) {
        logError(e);
    }
});
