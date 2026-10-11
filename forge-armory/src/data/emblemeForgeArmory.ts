// FR : ⚠️ AJOUT (01/10/2026, v0.3.0) - EMBLÈME VECTORIEL Forge Armory, pour le
// FILIGRANE des fiches (fenêtre « Voir », exports JPEG, PNG et PDF). Source UNIQUE :
// l'export l'insère en texte dans sa page HTML (`emblemeSvg`), la fenêtre « Voir »
// via le composant `Filigrane`. Vectoriel : net à toute taille, y compris dans le PDF.
//
// Origine : `forge-armory-emblem.svg`, fourni par l'utilisateur (vectorisation de
// l'emblème, matière métallique simplifiée en dégradé). ⚠️ CORRECTION (01/10/2026) :
// dans ce fichier, le cristal du BAS était COUPÉ NET au bord du cadre (y = 1023),
// sans sa pointe. Sa partie tracée est gardée telle quelle (la base du cristal du bas
// n'est volontairement pas le miroir de celle du haut, comme dans l'image d'identité) ;
// seule la POINTE extérieure est complétée, en miroir de celle du cristal du haut
// (symétrie autour de y = 550, centre du cercle), et le cadre passe de 1024 x 1024 à
// 1024 x 1100. Fichiers dans ressources-installateur/forge-armory/ : `-emblem.svg`
// (corrigé) et `-emblem-original.svg`.
// EN: ⚠️ ADDED - Forge Armory VECTOR EMBLEM for the sheets' WATERMARK. Single source for
// the export (HTML text) and the "View" window (component). The supplied file's BOTTOM
// crystal was cut flat at the frame edge: its tip was completed by mirroring the top
// crystal's tip, and the frame extended to 1024 x 1100.

export const EMBLEME_VIEWBOX = "0 0 1024 1100";

/** FR : opacité du filigrane (identique partout) : 7 % choisie sur aperçu, texte resté net. / EN: watermark opacity, same everywhere. */
export const OPACITE_FILIGRANE = 0.07;

const ARGENT: string[] = [
  "M 779 331 L 775 332 L 743 352 L 607 443 L 566 473 L 542 497 L 542 499 L 561 513 L 576 531 L 587 550 L 594 569 L 599 569 L 653 550 L 684 537 L 699 529 L 743 419 L 778 337 Z",
  "M 245 331 L 325 530 L 371 550 L 429 569 L 436 551 L 443 538 L 458 518 L 472 505 L 481 499 L 479 493 L 453 469 L 408 437 L 254 335 Z",
  "M 433 590 L 410 580 L 393 575 L 378 573 L 364 584 L 340 607 L 307 645 L 310 659 L 326 706 L 330 731 L 329 752 L 325 772 L 319 792 L 308 818 L 310 818 L 389 759 L 413 736 L 435 708 L 435 701 L 430 695 L 412 664 L 415 663 L 431 667 L 450 668 L 460 641 L 464 621 L 455 608 Z",
  "M 591 590 L 578 599 L 567 610 L 559 622 L 559 627 L 563 641 L 573 668 L 594 667 L 608 663 L 611 664 L 596 691 L 587 703 L 588 708 L 605 731 L 631 757 L 674 790 L 709 815 L 714 817 L 714 814 L 702 788 L 694 757 L 692 736 L 696 707 L 716 646 L 684 608 L 666 590 L 645 573 L 639 573 L 614 580 Z",
  "M 450 171 L 413 179 L 384 188 L 348 203 L 323 216 L 291 237 L 258 264 L 232 290 L 208 319 L 191 344 L 176 370 L 164 395 L 150 431 L 139 472 L 133 507 L 130 538 L 130 577 L 133 608 L 138 637 L 148 675 L 159 706 L 175 740 L 185 757 L 204 785 L 222 807 L 239 825 L 276 857 L 323 887 L 361 905 L 389 915 L 419 923 L 457 929 L 455 915 L 453 911 L 422 906 L 384 895 L 354 883 L 321 866 L 296 850 L 275 834 L 241 802 L 219 776 L 206 758 L 187 726 L 175 700 L 165 673 L 156 641 L 150 608 L 147 580 L 147 539 L 149 515 L 156 475 L 163 447 L 170 425 L 181 398 L 198 365 L 219 333 L 244 302 L 271 275 L 312 243 L 344 224 L 387 205 L 427 193 L 446 189 L 453 189 L 455 186 L 457 171 Z",
  "M 567 170 L 570 187 L 572 189 L 590 191 L 633 203 L 665 216 L 709 240 L 732 256 L 754 274 L 784 304 L 813 342 L 829 369 L 853 423 L 869 482 L 874 516 L 876 545 L 876 566 L 873 605 L 868 634 L 861 662 L 849 696 L 835 726 L 825 744 L 796 785 L 761 823 L 736 844 L 716 858 L 671 883 L 636 897 L 599 907 L 571 911 L 568 922 L 568 929 L 601 924 L 636 915 L 675 900 L 701 887 L 736 865 L 757 849 L 773 835 L 807 799 L 820 782 L 847 739 L 864 703 L 875 672 L 884 637 L 890 600 L 892 577 L 892 531 L 889 501 L 881 458 L 865 407 L 853 379 L 839 352 L 820 322 L 797 293 L 774 269 L 751 249 L 724 229 L 696 212 L 656 193 L 625 182 L 593 174 Z",
  "M 483 517 L 470 528 L 457 545 L 448 562 L 444 573 L 444 578 L 455 586 L 467 598 L 479 616 L 480 625 L 498 695 L 505 731 L 507 731 L 504 661 L 501 627 L 485 517 Z",
  "M 541 517 L 539 517 L 536 531 L 522 636 L 518 695 L 518 728 L 520 728 L 545 614 L 554 601 L 571 584 L 580 578 L 580 574 L 575 561 L 566 544 L 556 531 Z",
  "M 511 411 L 498 415 L 491 420 L 485 427 L 479 441 L 477 460 L 492 477 L 502 497 L 504 497 L 504 489 L 500 468 L 486 454 L 486 446 L 490 444 L 507 448 L 509 455 L 509 465 L 515 465 L 516 449 L 536 444 L 538 448 L 538 454 L 528 462 L 523 469 L 519 500 L 521 500 L 531 478 L 547 460 L 547 454 L 542 432 L 536 423 L 528 416 L 522 413 Z",
  "M 916 507 L 917 513 L 923 527 L 927 544 L 941 554 L 927 567 L 924 581 L 916 604 L 918 604 L 976 557 L 977 553 L 952 535 L 918 507 Z",
  "M 101 507 L 66 537 L 46 552 L 45 556 L 83 587 L 101 604 L 103 604 L 103 600 L 99 592 L 92 567 L 79 555 L 82 551 L 93 543 L 95 532 L 103 511 L 103 507 Z",
  "M 859 553 L 824 553 L 821 554 L 821 556 L 859 557 Z",
  "M 163 553 L 164 557 L 199 556 L 198 553 Z",
];

const CYAN: string[] = [
  "M 511 22 L 486 151 L 478 184 L 478 190 L 498 294 L 511 375 L 513 375 L 542 210 L 545 200 L 546 181 L 522 69 L 520 54 L 517 45 L 516 34 L 513 22 Z",
  "M 511 760 L 510 770 L 507 779 L 489 869 L 478 916 L 486 949 L 511 1078 L 513 1078 L 516 1066 L 517 1055 L 520 1046 L 522 1031 L 546 921 L 546 910 L 518 788 L 513 760 Z",
];

/**
 * FR : l'emblème en balise `<svg>` (texte). `prefixe` rend uniques les identifiants des
 * dégradés (plusieurs emblèmes dans une même page) ; `attributs` s'ajoutent à la balise
 * (classe, style...). Aucune donnée venant de l'utilisateur n'y entre.
 * EN: the emblem as an `<svg>` string; `prefixe` makes gradient ids unique.
 */
export function emblemeSvg(prefixe: string, attributs = ""): string {
  const chemins = (liste: string[], remplissage: string) => liste.map((d) => `<path d="${d}" fill="url(#${prefixe}-${remplissage})"/>`).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${EMBLEME_VIEWBOX}" ${attributs}>` +
    `<defs>` +
    `<linearGradient id="${prefixe}-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d9dde2"/><stop offset="1" stop-color="#ffffff"/></linearGradient>` +
    `<linearGradient id="${prefixe}-cyan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52e7ff"/><stop offset="0.5" stop-color="#00aef5"/><stop offset="1" stop-color="#0087d9"/></linearGradient>` +
    `</defs><g shape-rendering="geometricPrecision">${chemins(ARGENT, "silver")}${chemins(CYAN, "cyan")}</g></svg>`
  );
}
