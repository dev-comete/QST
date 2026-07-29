# Documentation des Formules Mathématiques - Analytics LMS

Ce document détaille les formules et méthodes de calcul utilisées dans le backend (Django) pour générer les statistiques des vagues et les bulletins des apprenants.

---

## 1. Statistiques Globales de la Vague (Vue Formateur)
Ces calculs offrent une vue d'ensemble des performances d'une cohorte (Vague) sur l'ensemble de ses quiz.

### 1.1. Points Totaux Possibles
La somme de tous les points configurés pour l'ensemble des questions de tous les quiz de la vague.
$$ \text{Total Max Points} = \sum_{q \in \text{Quizzes}} \sum_{k \in q} \text{Bareme}_k $$
* **Implémentation Django** : `Sum('bareme__pts')` sur tous les `QuizQuestion` de la formation.

### 1.2. Score Cumulé par Étudiant
Le nombre total de points qu'un étudiant spécifique a obtenus sur tous les quiz terminés de cette vague.
$$ \text{Score Cumulé}_e = \sum_{q \in \text{Quizzes Terminés}} \text{Score Obtenu}_{e, q} $$

### 1.3. Moyenne Globale de la Classe
La moyenne des scores cumulés de tous les étudiants inscrits à la vague.
$$ \text{Moyenne Globale} = \frac{\sum \text{Scores Cumulés des Étudiants}}{\text{Nombre Total d'Étudiants}} $$
* **Implémentation Django** : `Avg('score_cumule')`

### 1.4. Taux de Réussite Global
Le pourcentage d'étudiants ayant obtenu au moins la moyenne (50% des points totaux possibles).
$$ \text{Seuil de Réussite} = \frac{\text{Total Max Points}}{2} $$
$$ \text{Taux de Réussite Global (\%)} = \left( \frac{\text{Nombre d'étudiants ayant (Score Cumulé} \ge \text{Seuil)}}{\text{Nombre Total d'Étudiants}} \right) \times 100 $$

---

## 2. Statistiques Par Quiz (Vue Formateur)
Ces calculs permettent au formateur d'analyser la performance de la classe sur un quiz spécifique.

### 2.1. Taux de Participation
Le pourcentage d'étudiants inscrits ayant terminé ce quiz.
$$ \text{Taux de Participation (\%)} = \left( \frac{\text{Nombre de tentatives terminées}}{\text{Nombre Total d'Étudiants}} \right) \times 100 $$

### 2.2. Moyenne de la Classe (au Quiz)
La moyenne des scores obtenus uniquement par les étudiants ayant rendu leur copie.
$$ \text{Moyenne du Quiz} = \frac{\sum \text{Scores Obtenus au Quiz}}{\text{Nombre de Participants}} $$

### 2.3. Taux de Réussite (au Quiz)
Le pourcentage de participants ayant obtenu la moyenne à ce quiz spécifique.
$$ \text{Taux de Réussite Quiz (\%)} = \left( \frac{\text{Participants ayant (Score} \ge \frac{\text{Max Points du Quiz}}{2})}{\text{Nombre de Participants}} \right) \times 100 $$

---

## 3. Bulletin de l'Apprenant (Vue Étudiant)
Ces calculs sont utilisés pour générer le rapport individuel de l'étudiant.

### 3.1. Pourcentage de Réussite (Par Quiz)
Le score de l'étudiant ramené sur une base de 100 pour une lecture facile.
$$ \text{Pourcentage Quiz (\%)} = \left( \frac{\text{Score Obtenu}}{\text{Points Maximum du Quiz}} \right) \times 100 $$
* **Note** : Arrondi à 1 décimale (ex: 86.7%). Si le quiz vaut 0 point, le pourcentage est forcé à 0.0 pour éviter une division par zéro.

### 3.2. Moyenne Générale (Pourcentage Global)
La note finale de l'étudiant, calculée sur la base des points réels accumulés par rapport au total des points existants dans la formation.
$$ \text{Moyenne Générale (\%)} = \left( \frac{\sum \text{Scores Obtenus (Tous Quiz)}}{\sum \text{Points Maximum (Tous Quiz)}} \right) \times 100 $$
* **Exemple** : S'il a 8/10 et 18/20, le calcul est (26 / 30) * 100, et non pas la moyenne des deux pourcentages (ce qui fausserait le poids des quiz).

### 3.3. Progression
Le ratio de complétion de la formation.
$$ \text{Progression} = \frac{\text{Nombre de Quiz Terminés}}{\text{Nombre Total de Quiz dans la Formation}} $$