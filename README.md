# GLOW&GET Maison — thème Shopify

**YOUR STYLE, YOUR GLOW**

Thème Shopify Online Store 2.0 sur mesure pour la boutique GLOW&GET. C'est un magazine de mode transformé en boutique : bandeaux bordeaux et rose poudré, campagnes sur fond gris perle, fiches produits sur fond crème, titres en serif fine et accents cursifs.

Aucune photographie n'est incluse. Chaque emplacement photo est déjà dessiné aux bonnes proportions : un bloc neutre avec un cadre fin, un ornement et l'indication du format attendu. Il est remplacé automatiquement dès que vous ajoutez votre image.

---

## 1. Installer le thème

**Option A : connexion GitHub (recommandée)**
1. Dans Shopify : *Boutique en ligne → Thèmes → Ajouter un thème → Connecter depuis GitHub*.
2. Choisissez ce dépôt et la branche. Shopify synchronise automatiquement chaque modification.

**Option B : fichier ZIP**
1. Téléchargez le dépôt au format ZIP. Les dossiers `layout`, `sections`, etc. doivent être à la racine du ZIP.
2. *Boutique en ligne → Thèmes → Ajouter un thème → Importer un fichier ZIP*.

Cliquez ensuite sur **Publier**.

## 2. Configuration initiale (15 minutes)

| Étape | Où dans Shopify | Quoi faire |
|---|---|---|
| Devise | *Paramètres → Marchés / Paramètres de la boutique* | Euro (EUR). Format conseillé : `{{amount_with_comma_separator}} €` |
| Paiements | *Paramètres → Paiements* | Activez **Shopify Payments** (CB, Visa, Mastercard, Apple Pay, Google Pay), **PayPal**, et un paiement en plusieurs fois (**Klarna**, **Alma** ou **Oney**). |
| Taxes | *Paramètres → Taxes et droits* | TVA France 20 %, prix TTC. |
| Livraison | *Paramètres → Expédition et livraison* | Tarifs France (Colissimo, Mondial Relay, etc.) et seuil de gratuité. |
| Pages légales | *Paramètres → Politiques* | Générez et complétez : CGV, confidentialité, remboursement, expédition, mentions légales. Le pied de page y renvoie automatiquement. |
| Page Favoris | *Boutique en ligne → Pages → Ajouter* | Titre « Favoris », modèle **page.wishlist**. Collez ensuite son adresse (`/pages/favoris`) dans *Personnaliser → Paramètres du thème → Panier & favoris*. |
| Page Contact | *Boutique en ligne → Pages → Ajouter* | Titre « Contact », modèle **page.contact**. |
| Menus | *Boutique en ligne → Navigation* | `main-menu` (en-tête et menu mobile) et `footer` (colonne « Collections » du pied de page). |
| Collections | *Produits → Collections* | Créez par exemple *New Arrivals*, *Best Sellers*, *The New Edit*, puis reliez-les aux sections de l'accueil via *Personnaliser*. |

## 3. Ajouter vos produits, références et stocks

*Produits → Ajouter un produit*
- **Photos** : glissez-déposez autant de photos que vous voulez dans « Supports multimédias ». Réorganisez-les par glisser-déposer (la première devient la photo principale, la deuxième apparaît au survol dans la grille) et supprimez-les depuis la même zone. Toutes s'affichent dans la galerie de la fiche produit.
- **Prix** en euros, et éventuellement un prix barré (« Prix avant réduction »).
- **Variantes** : ajoutez l'option « Taille » (XS, S, M, L, XL…). Chaque taille a son propre **SKU** et son propre **stock**.
- **Suivi des stocks** : cochez « Suivre la quantité ». Le site affiche « En stock », « Plus que X pièce(s) » ou « Épuisé », et bloque l'achat d'une taille épuisée.
- **Étiquette** `nouveau` : affiche un petit badge cursif « nouveauté » sur la carte produit.

Le SKU apparaît sous chaque article, sur la fiche produit, dans le panier et dans les commandes.

## 4. Ajouter vos photos de campagne

*Boutique en ligne → Thèmes → Personnaliser*, puis cliquez sur une section :

| Section | Emplacements | Formats conseillés |
|---|---|---|
| Campagne photo (slider) | Jusqu'à 6 diapositives, chacune en **collage** (3 photos), **diptyque** (2 photos) ou **pleine page** (1 photo et 1 version mobile) | Portrait 4:5, 3:4, 2:3 et 1:1 ; paysage 16:9 (≥ 2400 px) |
| Collection éditoriale (The New Edit, Shop All) | 1 grande photo et 2 photos secondaires | 4:5, 3:4, 1:1 |
| Bannière éditoriale | 1 photo ordinateur et 1 photo mobile | 21:9 et 4:5 |
| Mosaïque de collections | 1 photo par collection, sinon l'image de la collection | 3:4, 4:5, 2:3, 16:9 |
| Page collection | Image de la collection (*Produits → Collections*) | 16:9 |

Pour chaque section, vous pouvez aussi choisir le point focal de l'image et la couleur du texte posé sur la photo (bordeaux, crème ou noir).

## 5. Newsletter « JOIN THE GLOW&GET CLUB »

Le formulaire est natif Shopify : chaque inscription crée un **client** avec consentement marketing et les étiquettes `newsletter, club glow&get`.
Pour retrouver les inscrits : *Clients → filtrer « Abonné(e) aux e-mails »*. Pour leur écrire : **Shopify Email**, ou une application comme Klaviyo.

## 6. Réseaux sociaux

Snapchat **glow.get** et TikTok **@glow.get** sont déjà reliés dans le pied de page (« FOLLOW OUR WORLD »). Pour les modifier : *Personnaliser → Paramètres du thème → Réseaux sociaux*.

## 7. Favoris

Le cœur de chaque article ajoute ou retire l'article des favoris, et le compteur de l'en-tête se met à jour. La page Favoris affiche la sélection avec photo, prix, SKU, tailles et ajout au panier. Les favoris sont enregistrés sur l'appareil de la cliente, sans création de compte.

## 8. Ce que contient le thème

```
layout/theme.liquid          Structure générale
sections/                    En-tête, bandeau d'annonce, slider, bandeaux défilant et orné,
                             grilles produits, collections éditoriales, bannière, mosaïque,
                             newsletter, pied de page, fiche produit, collection, panier,
                             tiroir panier, favoris, recherche, contact, journal, 404
snippets/                    Emplacements photo, carte produit, prix, ornements, logo, icônes
templates/                   Pages (JSON), comptes clients, page mot de passe, carte cadeau
assets/glowget.css|js        Styles et interactions (panier AJAX, favoris, variantes, slider)
assets/font-*.woff2          Polices hébergées dans le thème (licence SIL OFL)
config/                      Couleurs, logo, proportions photos, réseaux sociaux
```

**Polices** : Cormorant Garamond (titres), Pinyon Script (cursive), Jost (texte). Elles sont servies depuis le CDN Shopify, sans appel à Google, ce qui évite un transfert d'adresses IP vers un tiers (RGPD).

**Accessibilité** : navigation au clavier, focus visible, tiroirs avec piège de focus et fermeture par Échap, défilement automatique mis en pause au survol et désactivé si l'appareil demande moins d'animations.

## 9. Bon à savoir

- **Bandeau cookies** : activez la bannière de consentement Shopify (*Paramètres → Confidentialité des clients*). Elle est obligatoire en France si vous utilisez des outils de suivi.
- **Mentions légales** : complétez la politique « Mentions légales » dans *Paramètres → Politiques*. Le pied de page renvoie déjà vers cette page (`/policies/legal-notice`).
- **Comptes clients** : le thème gère les comptes classiques. Avec les nouveaux comptes clients Shopify, l'icône compte redirige automatiquement vers l'espace client hébergé par Shopify.
