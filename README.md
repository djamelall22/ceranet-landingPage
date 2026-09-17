# CERANET — site refait

Site statique, deux langues (français / arabe RTL), sans framework ni
dépendance : plus de Tailwind CDN, plus de GSAP.

Hébergement : **Vercel**. La configuration est dans `vercel.json`
(cache des assets, en-têtes de sécurité, redirections). Les fichiers
`_headers` et `_redirects` sont l'équivalent Netlify : Vercel les
ignore, ils ne servent que si le site déménage un jour.

### Le site ne se met pas à jour ?

1. Déploiement par Git : vérifier que le commit est bien poussé sur la
   branche de production et que le build apparaît dans l'onglet
   « Deployments » de Vercel.
2. Déploiement manuel (`vercel --prod` ou glisser-déposer) : c'est le
   **dossier entier** qu'il faut renvoyer, pas seulement les fichiers
   modifiés.
3. Si le déploiement est vert mais que l'ancienne version s'affiche
   encore, c'est le cache du navigateur : rechargement forcé
   (Ctrl+Maj+R, ou Cmd+Maj+R sur Mac), ou une fenêtre privée pour
   vérifier.

## Arborescence

```
index.html          page française
index-ar.html       page arabe (RTL)
robots.txt          autorise explicitement les robots d'IA
sitemap.xml         avec les alternates hreflang
site.webmanifest
vercel.json         cache, en-têtes de sécurité et redirections (Vercel)
_headers            équivalent Netlify, ignoré par Vercel
_redirects          équivalent Netlify, ignoré par Vercel
assets/css/style.css
assets/js/app.js    menu, slider avant/après, sélecteur 5 L / 2 L
assets/js/form.js   validation, anti-robot, envoi Web3Forms
assets/img/         AVIF + WebP + PNG de secours, icônes, images Open Graph
```

## À faire avant la mise en ligne

1. **Domaine.** Remplacer `https://www.ceranet.dz` dans : `index.html`,
   `index-ar.html` (canonical, hreflang, og:url, JSON-LD), `sitemap.xml`,
   `robots.txt`.
2. **Dosages.** Dans la section « Comment l'utiliser », reprendre les
   indications exactes de l'étiquette (dilution, temps de pose). Les
   endroits sont signalés par un commentaire `À FAIRE` dans le HTML.
3. **Avant / après.** Le bloc est une simulation en CSS. Deux vraies
   photos chez un client seraient bien plus convaincantes, et c'est le
   type de contenu de première main que Google valorise.
4. **Données structurées.** Compléter l'adresse postale, les prix et les
   liens réseaux sociaux dans le bloc JSON-LD en bas de chaque page.
5. **Search Console.** Déclarer le site et soumettre `sitemap.xml`.
6. **Google Business Profile.** Le levier hors-site le plus rentable pour
   un commerce local ; Google le recommande explicitement dans son guide
   sur la recherche générative.
7. **E-mail.** Une adresse sur le domaine plutôt que Gmail.

## Poids

Premier affichage : environ 240 Ko en desktop, 210 Ko en mobile.
Aucune ressource bloquante hors la feuille de style Google Fonts.
Avant refonte : plus de 5 Mo.

La bannière de marque est conservée en tête de page. Elle est servie en
AVIF (WebP puis JPEG en secours), avec deux cadrages distincts choisis
par `<picture media>` : un seul fichier est téléchargé selon l'appareil,
contre les deux images chargées par l'ancienne version qui en masquait
une en CSS. La bannière desktop passe de 1,81 Mo à 73 Ko.

Le titre principal (H1) et le texte d'introduction sont placés juste
sous la bannière. C'est ce texte que Google et les assistants IA
indexent : le message de la bannière, lui, reste une image illisible
pour eux.

## Points de vigilance

- Les images sont servies en AVIF, puis WebP, puis PNG. Ne pas renommer
  les fichiers sans mettre à jour les `srcset`.
- `_headers` met les assets en cache un an (`immutable`). Si une image
  change, changer aussi son nom de fichier.
- La clé Web3Forms visible dans le HTML est publique par conception :
  elle n'autorise qu'un envoi vers l'adresse configurée sur le compte.
- Les anciennes bannières PNG ne sont plus chargées par le site. Elles
  restent parfaites pour Facebook et Instagram.
