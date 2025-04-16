// Au début du script, ajoutez cette fonction pour détecter les erreurs
function logError(error) {
    console.error("Erreur détectée:", error);
}

// Initialisation au chargement de la page avec gestion d'erreur
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log("DOM chargé, initialisation du simulateur...");
        
        // Ajouter des événements explicites sur les boutons de catégorie
        document.querySelectorAll('.category-button').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category') || this.querySelector('span:last-child').textContent.toLowerCase().trim();
                selectCategory(category, this);
            });
        });
        
        // Initialiser autres éléments comme inputs, etc.
        const nombrePersonnesInput = document.getElementById('nombrePersonnes');
        if (nombrePersonnesInput) {
            nombrePersonnesInput.addEventListener('input', checkPersonnes);
        }
        
        goToPage(1);
        console.log("Simulateur initialisé avec succès");
    } catch (error) {
        logError(error);
    }
});


// Variables globales
let selectedCategory = '';
let nombrePersonnes = 0;
let dureeJours = 1;
let genre = 'mixte';
let dureeSuperieureA6h = false;
let proportionHommes = 70;

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

// Vérifier la validité du nombre de personnes
function checkPersonnes() {
    nombrePersonnes = parseInt(document.getElementById('nombrePersonnes').value) || 0;
    
    if (nombrePersonnes > 0) {
        document.getElementById('nextBtn2').classList.remove('btn-disabled');
    } else {
        document.getElementById('nextBtn2').classList.add('btn-disabled');
    }
}

// Changer la page
function goToPage(pageNumber) {
    if (pageNumber === 2 && document.getElementById('nextBtn1').classList.contains('btn-disabled')) {
        return;
    }
    
    if (pageNumber === 3 && document.getElementById('nextBtn2').classList.contains('btn-disabled')) {
        return;
    }
    
    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Afficher la page demandée
    document.getElementById('page' + pageNumber).classList.add('active');
    
    // Mettre à jour la barre de progression
    updateProgressBar(pageNumber);
    
    // Mettre à jour les variables selon les entrées
    if (pageNumber === 3) {
        dureeJours = parseInt(document.getElementById('dureeJours').value) || 1;
    }
}

// Mettre à jour la barre de progression
function updateProgressBar(pageNumber) {
    // Réinitialiser les étapes
    document.querySelectorAll('.step-number').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelectorAll('.progress-line').forEach(line => {
        line.classList.remove('active');
    });
    
    // Activer les étapes jusqu'à la page courante
    for (let i = 1; i <= pageNumber; i++) {
        document.getElementById('step' + i).classList.add('active');
        if (i < pageNumber) {
            document.getElementById('line' + i).classList.add('active');
        }
    }
}

// Définir le genre
function setGenre(value) {
    genre = value;
}

// Définir la durée d'événement
function setDureeEvenement() {
    dureeSuperieureA6h = document.getElementById('dureeEvenement').value === 'superieur';
}

// Mettre à jour la proportion hommes/femmes
function updateProportion() {
    proportionHommes = parseInt(document.getElementById('proportionHommes').value);
    document.getElementById('proportionLabel').textContent = 
        proportionHommes + '% hommes, ' + (100 - proportionHommes) + '% femmes';
}

// Calculer le résultat
function calculerResultat() {
    // Récupérer les valeurs finales des champs
    dureeJours = parseInt(document.getElementById('dureeJours').value) || 1;
    
    // Calculer le nombre de WC nécessaires
    let resultat = calculateWC();
    
    // Afficher les résultats
    document.getElementById('resultatWC').textContent = resultat.total;
    
    if ((selectedCategory === 'chantier' || selectedCategory === 'industrie') && genre === 'separe') {
        document.getElementById('detailsGenre').style.display = 'block';
        document.getElementById('resultHommes').textContent = resultat.hommes;
        document.getElementById('resultFemmes').textContent = resultat.femmes;
    } else {
        document.getElementById('detailsGenre').style.display = 'none';
    }
    
    // Afficher le récapitulatif
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
    
    // Aller à la page de résultats
    goToPage(4);
}

// Calcul du nombre de WC nécessaires
function calculateWC() {
    let nombreWC = 0;
    let detailsHommes = 0;
    let detailsFemmes = 0;
    
    if (selectedCategory === 'evenementiel') {
        // Pour les événements
        let nombreCabines = 0;
        
        if (!dureeSuperieureA6h) {
            // Événement inférieur à 6h
            if (nombrePersonnes <= 65) {
                nombreCabines = 1;
            } else if (nombrePersonnes <= 130) {
                nombreCabines = 2;
            } else if (nombrePersonnes <= 195) {
                nombreCabines = 3;
            } else {
                nombreCabines = 3 + Math.ceil((nombrePersonnes - 195) / 65);
            }
        } else {
            // Événement supérieur à 6h
            if (nombrePersonnes <= 35) {
                nombreCabines = 1;
            } else if (nombrePersonnes <= 70) {
                nombreCabines = 2;
            } else if (nombrePersonnes <= 105) {
                nombreCabines = 3;
            } else {
                nombreCabines = 3 + Math.ceil((nombrePersonnes - 105) / 35);
            }
        }
        
        nombreWC = Math.max(1, nombreCabines);
    } 
    else if (selectedCategory === 'chantier') {
        // Pour les chantiers
        let nombreCabinesHommes = 0;
        let nombreCabinesFemmes = 0;
        
        const propH = proportionHommes / 100;
        const propF = 1 - propH;
        
        const nbHommes = Math.ceil(nombrePersonnes * propH);
        const nbFemmes = Math.ceil(nombrePersonnes * propF);
        
        // Calcul pour les hommes
        if (nbHommes <= 7) {
            nombreCabinesHommes = 1;
        } else if (nbHommes <= 14) {
            nombreCabinesHommes = 2;
        } else if (nbHommes <= 21) {
            nombreCabinesHommes = 3;
        } else {
            nombreCabinesHommes = 3 + Math.ceil((nbHommes - 21) / 7);
        }
        
        // Calcul pour les femmes
        if (nbFemmes <= 7) {
            nombreCabinesFemmes = 1;
        } else if (nbFemmes <= 14) {
            nombreCabinesFemmes = 2;
        } else if (nbFemmes <= 21) {
            nombreCabinesFemmes = 3;
        } else {
            nombreCabinesFemmes = 3 + Math.ceil((nbFemmes - 21) / 7);
        }
        
        // Facteur de durée pour chantiers longue durée
        const facteurDuree = dureeJours > 30 ? 1.2 : 1;
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
    else if (selectedCategory === 'industrie') {
        // Pour l'industrie, même calcul que chantier mais avec répartition 50/50
        let nombreCabinesHommes = 0;
        let nombreCabinesFemmes = 0;
        
        const propH = 0.5;
        const propF = 0.5;
        
        const nbHommes = Math.ceil(nombrePersonnes * propH);
        const nbFemmes = Math.ceil(nombrePersonnes * propF);
        
        // Calcul pour les hommes
        if (nbHommes <= 7) {
            nombreCabinesHommes = 1;
        } else if (nbHommes <= 14) {
            nombreCabinesHommes = 2;
        } else if (nbHommes <= 21) {
            nombreCabinesHommes = 3;
        } else {
            nombreCabinesHommes = 3 + Math.ceil((nbHommes - 21) / 7);
        }
        
        // Calcul pour les femmes
        if (nbFemmes <= 7) {
            nombreCabinesFemmes = 1;
        } else if (nbFemmes <= 14) {
            nombreCabinesFemmes = 2;
        } else if (nbFemmes <= 21) {
            nombreCabinesFemmes = 3;
        } else {
            nombreCabinesFemmes = 3 + Math.ceil((nbFemmes - 21) / 7);
        }
        
        // Facteur de durée pour projets longue durée
        const facteurDuree = Math.min(1.5, 1 + (dureeJours / 180));
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

// Réinitialiser le calculateur
function resetCalculator() {
    // Réinitialiser les variables
    selectedCategory = '';
    nombrePersonnes = 0;
    dureeJours = 1;
    genre = 'mixte';
    dureeSuperieureA6h = false;
    proportionHommes = 70;
    
    // Réinitialiser les formulaires
    document.getElementById('nombrePersonnes').value = '';
    document.getElementById('dureeJours').value = '1';
    document.getElementById('genreMixte').checked = true;
    document.getElementById('genreSepare').checked = false;
    document.getElementById('dureeEvenement').value = 'inferieur';
    document.getElementById('proportionHommes').value = '70';
    document.getElementById('proportionLabel').textContent = '70% hommes, 30% femmes';
    
    // Désélectionner tous les boutons de catégorie
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Désactiver les boutons suivants
    document.getElementById('nextBtn1').classList.add('btn-disabled');
    document.getElementById('nextBtn2').classList.add('btn-disabled');
    
    // Retourner à la première page
    goToPage(1);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que tous les éléments sont bien configurés au démarrage
    goToPage(1);
});
