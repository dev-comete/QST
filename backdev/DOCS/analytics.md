# Règles de Calcul des Statistiques LMS (Guide Simplifié)

Ce document explique comment l'application calcule les statistiques et les notes. Les formules sont décrites simplement, telles qu'elles fonctionnent dans la vraie vie pour un professeur.

---

## 1. Vue d'ensemble de la classe (Statistiques Globales)
Ces indicateurs permettent au formateur de juger le niveau global de toute une promotion (la "Vague").

### 1.1. Le Total des Points Possibles
* **La règle :** C'est le score maximum parfait qu'un étudiant pourrait obtenir s'il avait tout juste à tous les quiz de la formation.
* **Le calcul :** On additionne simplement les points (le barème) de chaque question de chaque quiz.
* *Exemple : Si le Quiz 1 vaut 10 points et le Quiz 2 vaut 20 points, le total de la vague est de 30 points.*

### 1.2. Le Score Cumulé (par étudiant)
* **La règle :** C'est la "cagnotte" de points de l'étudiant.
* **Le calcul :** On additionne toutes les notes qu'il a obtenues sur les quiz qu'il a terminés.

### 1.3. La Moyenne Globale de la Classe
* **La règle :** Permet de savoir si la promotion est globalement performante.
* **Le calcul :** (Somme des scores cumulés de tous les étudiants) ÷ (Nombre total d'étudiants inscrits).

### 1.4. Le Taux de Réussite Global
* **La règle :** Quel pourcentage de la classe a "la moyenne" sur l'ensemble de la formation ?
* **Le calcul :** 
  1. On détermine la moyenne à atteindre (la moitié du Total des Points Possibles).
  2. On compte combien d'étudiants ont atteint ou dépassé ce seuil.
  3. (Nombre d'étudiants ayant la moyenne ÷ Nombre total d'étudiants) × 100.

---

## 2. Analyse d'un Quiz spécifique (Vue Formateur)
Ces indicateurs aident le formateur à voir si un quiz en particulier était trop dur, trop facile, ou boudé par les étudiants.

### 2.1. Le Taux de Participation
* **La règle :** Combien d'élèves ont rendu leur copie ?
* **Le calcul :** (Nombre d'étudiants ayant terminé le quiz ÷ Nombre total d'étudiants inscrits) × 100.

### 2.2. La Moyenne du Quiz
* **La règle :** La note moyenne obtenue à ce test précis.
* **Le calcul :** (Somme des notes obtenues à ce quiz) ÷ (Nombre d'étudiants ayant rendu leur copie).
* *Note : Les étudiants qui n'ont pas fait le quiz ne font pas baisser cette moyenne.*

### 2.3. Le Taux de Réussite au Quiz
* **La règle :** Combien de participants ont validé ce quiz ?
* **Le calcul :** (Nombre d'étudiants ayant eu la moitié des points ou plus ÷ Nombre de participants) × 100.

---

## 3. Le Bulletin de Notes (Vue Étudiant)
Ce sont les calculs utilisés pour afficher les résultats personnels de l'apprenant sur son tableau de bord.

### 3.1. Le Pourcentage par Quiz
* **La règle :** Transforme la note du quiz en un pourcentage (plus facile à lire, comme une jauge).
* **Le calcul :** (Note de l'étudiant au quiz ÷ Points maximum de ce quiz) × 100.
* *Exemple : Un 8/10 s'affiche comme 80%.*

### 3.2. La Moyenne Générale (La note finale)
* **La règle :** C'est la véritable moyenne de l'étudiant. Elle prend en compte le poids de chaque quiz (un gros quiz impacte plus la moyenne qu'un petit quiz).
* **Le calcul :** (Total des points gagnés par l'étudiant) ÷ (Total des points possibles jusqu'à présent) × 100.
* *Exemple crucial : S'il a eu 8/10 au Quiz 1 et 18/20 au Quiz 2, on ne fait pas la moyenne des pourcentages. On additionne ses points (26) sur le total possible (30). Sa moyenne est donc (26 ÷ 30) × 100 = 86,7%.*

### 3.3. La Progression
* **La règle :** Indique où en est l'étudiant dans sa formation.
* **L'affichage :** "Nombre de quiz terminés" sur le "Nombre total de quiz".
* *Exemple : "2/5 quiz terminés".*