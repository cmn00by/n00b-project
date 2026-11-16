// La porte d'entrée du module economy : les autres modules n'importent que ce fichier.
// Pour donner de l'argent, une autre brique annonce un fait (mission:succeeded…) ; pour en prendre, elle envoie la commande economy:spend.
export { economySystem } from './economySystem'
