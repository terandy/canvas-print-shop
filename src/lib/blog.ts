/**
 * Editorial content for the blog.
 *
 * Posts live here as structured data rather than in the database: they change
 * rarely, they need to be fully bilingual, and keeping them in source means
 * they are reviewable in pull requests. Body paragraphs are plain strings —
 * a leading "## " marks a subheading.
 */

export type BlogPost = {
  slug: string;
  /** ISO date — surfaces as `datePublished` in Article schema. */
  published: string;
  updated?: string;
  en: BlogContent;
  fr: BlogContent;
};

export type BlogContent = {
  title: string;
  /** Meta description. Keep under 160 characters. */
  description: string;
  /** Short lede shown on the index and under the H1. */
  excerpt: string;
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-resolution-do-i-need-for-a-canvas-print",
    published: "2026-07-24",
    en: {
      title: "What Resolution Do I Need for a Canvas Print?",
      description:
        "How many pixels you actually need for a sharp canvas print at 16x20, 24x36 and 36x48 — and why the usual 300 DPI advice does not apply to canvas.",
      excerpt:
        "The short answer: fewer pixels than you have been told. Here is how to check whether your photo will print sharply before you order.",
      body: [
        "The advice you will find everywhere is that you need 300 DPI to print anything. That number comes from commercial offset printing — magazines, brochures, things you hold at reading distance. Canvas is not viewed at reading distance, and canvas is not a smooth substrate, so applying the 300 DPI rule to a canvas print will send you looking for a file four times larger than you actually need.",
        "## What resolution actually means here",
        "DPI on its own is meaningless. What matters is the pixel dimensions of your file divided by the physical size you are printing. A 3000 × 2000 pixel photo printed at 10 × 15 inches is 200 DPI. The same file printed at 20 × 30 inches is 100 DPI. Same photo, same pixels — the only thing that changed is how far apart those pixels get spread.",
        "Because a canvas hangs on a wall and you look at it from across the room rather than from 30 cm away, the effective resolution requirement drops substantially. The weave of the canvas itself also breaks up fine detail, which hides softness that would be obvious on glossy photo paper.",
        "## The numbers we work to",
        "For our standard sizes, these are the minimums we look for before printing:",
        "16x20 — at least 1600 × 2000 pixels. 24x36 — at least 2400 × 3600 pixels. 36x48 — at least 3600 × 4800 pixels.",
        "That works out to roughly 100 pixels per inch, which is well below the 300 DPI figure and entirely appropriate for wall art. Photos from any phone released in the last five or six years will clear the 16x20 threshold without difficulty. A 12-megapixel phone photo is typically around 4000 × 3000 pixels, which is enough for a 36x48 at the numbers above.",
        "## How to check your own file",
        "On a Mac, right-click the image, choose Get Info, and look at Dimensions. On Windows, right-click, Properties, then the Details tab. On a phone, open the photo and look at the info panel — on iOS, swipe up on the photo; on Android, tap the three-dot menu and choose Details.",
        "You are looking for two numbers like 4032 × 3024. Compare them against the minimums above for the size you want. If your smaller number clears the requirement, you are fine.",
        "## What we do if the file is short",
        "We check every uploaded file against the size you selected before anything goes to the printer. If the resolution will not hold up, we contact you — either to suggest a smaller size or to ask whether you have a higher-resolution version. We would rather have that conversation before printing than ship something soft and deal with a return afterwards.",
        "## Things that matter more than resolution",
        "In practice, most disappointing canvas prints are not caused by insufficient pixels. They are caused by motion blur, missed focus, or heavy digital zoom at the time the photo was taken. None of those can be fixed by having a larger file, because the detail was never captured.",
        "Before you order, open your photo and zoom in to 100% on the most important part of the image — usually someone's eyes. If that detail is crisp at 100%, the print will be good. If it is already soft on screen, enlarging it onto canvas will make that softness more visible, not less.",
        "The other common issue is a screenshot or a file that has been sent through a messaging app. Both WhatsApp and Messenger recompress images aggressively and can reduce a 4000-pixel photo to under 1000 pixels. Always print from the original file, not from a copy that has been forwarded.",
      ],
    },
    fr: {
      title: "Quelle résolution faut-il pour une impression sur toile ?",
      description:
        "Combien de pixels il faut réellement pour une toile nette en 16x20, 24x36 et 36x48 — et pourquoi la règle des 300 PPP ne s'applique pas à la toile.",
      excerpt:
        "Réponse courte : moins de pixels qu'on vous l'a dit. Voici comment vérifier si votre photo s'imprimera nettement avant de commander.",
      body: [
        "Le conseil que l'on trouve partout, c'est qu'il faut 300 PPP pour imprimer quoi que ce soit. Ce chiffre vient de l'impression offset commerciale — magazines, brochures, des objets qu'on tient à distance de lecture. Une toile ne se regarde pas à distance de lecture, et la toile n'est pas un support lisse : appliquer la règle des 300 PPP à une impression sur toile vous fera chercher un fichier quatre fois plus gros que nécessaire.",
        "## Ce que la résolution signifie vraiment ici",
        "Les PPP seuls ne veulent rien dire. Ce qui compte, ce sont les dimensions en pixels de votre fichier divisées par la taille physique d'impression. Une photo de 3000 × 2000 pixels imprimée en 10 × 15 pouces donne 200 PPP. Le même fichier imprimé en 20 × 30 pouces donne 100 PPP. Même photo, mêmes pixels — seule change la distance sur laquelle ces pixels sont répartis.",
        "Comme une toile est accrochée au mur et qu'on la regarde depuis l'autre bout de la pièce plutôt qu'à 30 cm, l'exigence de résolution effective baisse considérablement. Le tissage de la toile lui-même fragmente aussi les détails fins, ce qui masque un manque de netteté qui sauterait aux yeux sur du papier photo lustré.",
        "## Les chiffres avec lesquels nous travaillons",
        "Pour nos formats standards, voici les minimums que nous exigeons avant d'imprimer :",
        "16x20 — au moins 1600 × 2000 pixels. 24x36 — au moins 2400 × 3600 pixels. 36x48 — au moins 3600 × 4800 pixels.",
        "Cela correspond à environ 100 pixels par pouce, bien en dessous des 300 PPP et tout à fait approprié pour de l'art mural. Les photos de n'importe quel téléphone sorti depuis cinq ou six ans franchissent le seuil du 16x20 sans difficulté. Une photo de 12 mégapixels fait généralement environ 4000 × 3000 pixels, ce qui suffit pour un 36x48 selon les chiffres ci-dessus.",
        "## Comment vérifier votre fichier",
        "Sur Mac, faites un clic droit sur l'image, choisissez Lire les informations et regardez Dimensions. Sur Windows, clic droit, Propriétés, puis l'onglet Détails. Sur téléphone, ouvrez la photo et consultez le panneau d'information — sur iOS, balayez vers le haut ; sur Android, touchez le menu à trois points et choisissez Détails.",
        "Vous cherchez deux nombres du type 4032 × 3024. Comparez-les aux minimums ci-dessus pour le format souhaité. Si votre plus petit nombre dépasse l'exigence, tout va bien.",
        "## Ce que nous faisons si le fichier est insuffisant",
        "Nous vérifions chaque fichier téléversé par rapport au format choisi avant tout envoi à l'imprimante. Si la résolution ne tiendra pas la route, nous vous contactons — soit pour suggérer un format plus petit, soit pour demander si vous disposez d'une version plus haute résolution. Nous préférons avoir cette conversation avant l'impression plutôt que d'expédier une image floue et de gérer un retour ensuite.",
        "## Ce qui compte plus que la résolution",
        "En pratique, la plupart des toiles décevantes ne sont pas causées par un manque de pixels, mais par un flou de mouvement, une mise au point ratée ou un zoom numérique excessif au moment de la prise de vue. Rien de tout cela ne se corrige avec un fichier plus grand, parce que le détail n'a jamais été capté.",
        "Avant de commander, ouvrez votre photo et zoomez à 100 % sur la partie la plus importante de l'image — habituellement les yeux de quelqu'un. Si ce détail est net à 100 %, l'impression sera réussie. S'il est déjà flou à l'écran, l'agrandir sur toile rendra ce flou plus visible, pas moins.",
        "L'autre problème courant : une capture d'écran ou un fichier passé par une application de messagerie. WhatsApp et Messenger recompressent les images agressivement et peuvent réduire une photo de 4000 pixels à moins de 1000 pixels. Imprimez toujours à partir du fichier original, jamais d'une copie transférée.",
      ],
    },
  },
  {
    slug: "how-to-choose-canvas-print-size",
    published: "2026-07-24",
    en: {
      title: "How to Choose the Right Canvas Print Size for Your Wall",
      description:
        "A practical guide to sizing canvas prints above a sofa, a bed or in a hallway, with measurements for every common furniture width.",
      excerpt:
        "Almost everyone orders too small the first time. Here are the measurements that make a canvas look like it belongs on the wall.",
      body: [
        "The single most common regret we hear is that someone wishes they had gone bigger. A canvas that looked substantial on a screen can look stranded once it is on a wall with two metres of empty paint around it. The fix is not aesthetic judgement — it is arithmetic.",
        "## The two-thirds rule",
        "When artwork hangs above furniture, it should span roughly two-thirds of the width of that furniture. This is the single most useful guideline in the whole exercise.",
        "A standard three-seat sofa is about 210 cm wide. Two-thirds of that is 140 cm, which is a 36x48 canvas (90 × 120 cm) or two 24x36 canvases hung side by side. A loveseat at 150 cm calls for about 100 cm of artwork — a single 24x36. A queen bed at 152 cm wants the same.",
        "If your piece is significantly narrower than two-thirds, it reads as an accessory rather than as the focal point of the wall. Significantly wider and it starts to feel crowded against the edges of the furniture.",
        "## Hanging height",
        "For artwork over furniture, the bottom edge should sit 15 to 25 cm above the top of the sofa back or headboard. Closer than 15 cm and the two elements visually merge; further than 25 cm and the canvas floats free, disconnected from the furniture below it.",
        "For a wall with no furniture beneath it — a hallway, a stairwell, an entryway — use gallery convention instead: centre the artwork at about 145 cm from the floor. That is standard eye level and it is what museums use. It usually feels lower than people expect, which is exactly why so much domestic art is hung too high.",
        "## Sizing by room",
        "Hallways and entryways suit 16x20. These are spaces you pass through rather than sit in, viewed from close range, and a large canvas in a narrow corridor is overwhelming.",
        "Bedrooms suit 24x36 above a queen bed, or 36x48 above a king. Living rooms are where the large sizes earn their place — 36x48 above a three-seat sofa, or a pair of 24x36 canvases.",
        "Dining rooms are flexible because the wall is usually viewed from a seated position across the table. A single 36x48 works well as a statement piece behind the table.",
        "## Testing before you commit",
        "Cut a piece of newspaper or kraft paper to the exact dimensions you are considering and tape it to the wall. Leave it there for a day. This takes ten minutes and it is the only reliable way to know whether a size is right, because a canvas that seems enormous as a number on a website often looks modest once it is actually on a wall.",
        "If you are between two sizes after doing this, order the larger one. In eight years of making these, we have never had a customer tell us the canvas was too big.",
        "## Multiple canvases",
        "For a pair, keep 5 to 10 cm between the frames and treat the pair as a single unit when applying the two-thirds rule — measure the total span including the gap.",
        "For a gallery wall of three or more, start with one larger anchor piece and arrange smaller canvases around it, keeping the spacing consistent throughout. Even spacing is what makes an arrangement read as deliberate; uneven gaps read as accidental no matter how good the individual images are.",
        "One practical note: order the whole set in a single order. Canvases printed in the same run share identical colour handling, so they will hang together as a group rather than looking like three separate purchases made at different times.",
      ],
    },
    fr: {
      title: "Comment choisir le bon format de toile pour votre mur",
      description:
        "Guide pratique pour dimensionner une toile au-dessus d'un canapé, d'un lit ou dans un couloir, avec les mesures pour chaque largeur de meuble courante.",
      excerpt:
        "Presque tout le monde commande trop petit la première fois. Voici les mesures qui font qu'une toile semble à sa place sur le mur.",
      body: [
        "Le regret le plus fréquent que l'on nous rapporte, c'est d'avoir souhaité voir plus grand. Une toile qui paraissait imposante à l'écran peut sembler perdue une fois accrochée avec deux mètres de mur vide autour. La solution n'est pas une question de goût — c'est de l'arithmétique.",
        "## La règle des deux tiers",
        "Lorsqu'une œuvre est accrochée au-dessus d'un meuble, elle devrait occuper environ les deux tiers de la largeur de ce meuble. C'est le repère le plus utile de tout l'exercice.",
        "Un canapé trois places standard mesure environ 210 cm de large. Les deux tiers représentent 140 cm, soit une toile 36x48 (90 × 120 cm) ou deux toiles 24x36 côte à côte. Une causeuse de 150 cm appelle environ 100 cm d'œuvre — une seule 24x36. Un lit queen de 152 cm demande la même chose.",
        "Si votre pièce est nettement plus étroite que les deux tiers, elle se lit comme un accessoire plutôt que comme le point focal du mur. Nettement plus large, et elle paraît à l'étroit contre les bords du meuble.",
        "## Hauteur d'accrochage",
        "Pour une œuvre au-dessus d'un meuble, le bord inférieur devrait se situer de 15 à 25 cm au-dessus du dossier du canapé ou de la tête de lit. À moins de 15 cm, les deux éléments fusionnent visuellement ; au-delà de 25 cm, la toile flotte, détachée du meuble.",
        "Pour un mur sans meuble en dessous — un couloir, une cage d'escalier, une entrée — appliquez plutôt la convention de galerie : centrez l'œuvre à environ 145 cm du sol. C'est la hauteur de regard standard, celle qu'utilisent les musées. Elle paraît généralement plus basse que ce à quoi on s'attend, ce qui explique précisément pourquoi tant d'œuvres domestiques sont accrochées trop haut.",
        "## Le format selon la pièce",
        "Les couloirs et les entrées conviennent au 16x20. Ce sont des espaces de passage plutôt que de séjour, vus de près, et une grande toile dans un corridor étroit est écrasante.",
        "Les chambres conviennent au 24x36 au-dessus d'un lit queen, ou au 36x48 au-dessus d'un king. C'est au salon que les grands formats trouvent tout leur sens — un 36x48 au-dessus d'un canapé trois places, ou une paire de 24x36.",
        "La salle à manger est plus souple, car le mur se regarde habituellement assis, de l'autre côté de la table. Un seul 36x48 fonctionne bien comme pièce vedette derrière la table.",
        "## Tester avant de s'engager",
        "Découpez du papier journal ou du papier kraft aux dimensions exactes envisagées et fixez-le au mur. Laissez-le une journée. Cela prend dix minutes et c'est la seule façon fiable de savoir si un format convient, car une toile qui paraît énorme sous forme de chiffre sur un site web semble souvent modeste une fois réellement au mur.",
        "Si vous hésitez encore entre deux formats après cet essai, prenez le plus grand. En huit ans de fabrication, aucun client ne nous a jamais dit que sa toile était trop grande.",
        "## Plusieurs toiles",
        "Pour une paire, gardez de 5 à 10 cm entre les châssis et traitez la paire comme une seule unité en appliquant la règle des deux tiers — mesurez l'envergure totale, espace compris.",
        "Pour un mur-galerie de trois pièces ou plus, commencez par une pièce d'ancrage plus grande et disposez les toiles plus petites autour, en gardant un espacement constant. C'est la régularité de l'espacement qui fait qu'une composition paraît voulue ; des écarts inégaux paraissent accidentels, même avec d'excellentes images.",
        "Une note pratique : commandez l'ensemble en une seule commande. Les toiles imprimées dans la même série partagent un traitement des couleurs identique et s'accrocheront donc comme un groupe cohérent, plutôt que comme trois achats faits à des moments différents.",
      ],
    },
  },
  {
    slug: "canvas-print-vs-framed-photo-print",
    published: "2026-07-24",
    en: {
      title: "Canvas Print vs Framed Photo Print: Which Should You Choose?",
      description:
        "An honest comparison of canvas prints and framed paper prints — glare, longevity, cost and which type of photograph suits each.",
      excerpt:
        "They are not interchangeable. The right choice depends on the photograph, the room's lighting, and how you want the piece to read.",
      body: [
        "We make canvas, so treat what follows with appropriate scepticism — but there are photographs that genuinely belong behind glass, and we would rather say so than sell you the wrong thing.",
        "## Glare is the deciding factor in most rooms",
        "A framed print sits behind glass or acrylic. Both reflect light. In a room with a window opposite the wall, or with ceiling spots, a framed print will show reflections across part of the image for most of the day, and you will find yourself standing off to one side to actually see it.",
        "Canvas has no glazing at all. The surface is matte and the image is printed directly onto the weave, so there is nothing to reflect. In practical terms this is the strongest argument for canvas in living rooms, bedrooms and anywhere with lamps at low height.",
        "Anti-reflective glazing exists and works well, but it adds substantially to the cost of framing and it is rarely what you get from a high-street framer by default.",
        "## Which photographs suit which",
        "Canvas suits photographs with texture and depth — landscapes, portraits, pet photography, anything where the subject has surface detail that benefits from a slightly tactile presentation. The weave adds a physical quality that flatters skin tones and natural textures.",
        "Framed paper suits graphic work: fine art reproductions, architectural photography, anything with crisp straight lines or fine typography. The canvas weave slightly softens very fine detail, which is a disadvantage when the detail is the point.",
        "Documents, certificates and anything with small text should always be framed behind glass. Canvas is the wrong substrate for text.",
        "## Longevity",
        "Both can last decades; what matters is the ink and the substrate rather than the format. Our canvases use Canon Colorado UVgel ink, which carries a 30-year fade guarantee under normal indoor lighting.",
        "Framed prints are more vulnerable in one specific way: if the print is made with dye-based inkjet ink on standard photo paper, it can shift colour within a few years in a bright room, glass notwithstanding. Pigment-based prints on archival paper hold up as well as canvas does.",
        "Canvas has one durability advantage worth mentioning — no glass to break. If a canvas comes off the wall it dents at worst. A large framed print falling is a genuine hazard.",
        "## Cost",
        "For any given size, a stretched canvas is usually cheaper than the equivalent framed print, because framing involves a mount, glazing, a moulding and labour. The gap widens as size increases: at 36x48, custom framing frequently costs more than the print itself.",
        "Canvas also arrives ready to hang. A paper print requires a separate trip to a framer, which is both a cost and a delay that is easy to overlook when comparing prices online.",
        "## The middle option",
        "A floater frame gives you both. The canvas is stretched as usual, then set inside a thin frame with a small visible gap around the edge, so it reads as a finished framed piece while keeping the matte, glare-free surface. There is no glass involved.",
        "This is the option we recommend most often for wedding and family photography, where people want a more formal presentation than a bare gallery wrap but do not want reflections across a portrait.",
        "## A simple rule",
        "If the photograph is of people or places and the room has any meaningful daylight, choose canvas. If the piece is graphic, contains text, or is a valuable original work on paper, frame it behind glass. If you want the formality of a frame without the reflections, use a floater frame on canvas.",
      ],
    },
    fr: {
      title: "Toile ou photo encadrée : que choisir ?",
      description:
        "Comparaison honnête entre l'impression sur toile et l'impression papier encadrée — reflets, durabilité, coût et type de photo adapté à chacune.",
      excerpt:
        "Les deux ne sont pas interchangeables. Le bon choix dépend de la photo, de l'éclairage de la pièce et de l'effet recherché.",
      body: [
        "Nous fabriquons des toiles : accueillez donc ce qui suit avec le scepticisme approprié. Mais certaines photographies ont véritablement leur place derrière une vitre, et nous préférons le dire plutôt que de vous vendre le mauvais produit.",
        "## Les reflets tranchent la question dans la plupart des pièces",
        "Une impression encadrée est placée derrière du verre ou de l'acrylique. Les deux réfléchissent la lumière. Dans une pièce avec une fenêtre en face du mur, ou avec des projecteurs au plafond, une impression encadrée montrera des reflets sur une partie de l'image la majeure partie de la journée, et vous vous surprendrez à vous décaler sur le côté pour la voir vraiment.",
        "La toile n'a aucune vitre. La surface est mate et l'image est imprimée directement sur le tissage : il n'y a rien pour réfléchir la lumière. Concrètement, c'est l'argument le plus fort en faveur de la toile au salon, dans la chambre et partout où des lampes se trouvent à faible hauteur.",
        "Le verre antireflet existe et fonctionne bien, mais il augmente considérablement le coût de l'encadrement et c'est rarement ce qu'un encadreur vous fournit par défaut.",
        "## Quelle photo pour quel support",
        "La toile convient aux photographies avec de la texture et de la profondeur — paysages, portraits, photographie animalière, tout sujet dont la surface bénéficie d'un rendu légèrement tactile. Le tissage ajoute une qualité physique qui met en valeur les teints et les textures naturelles.",
        "Le papier encadré convient au travail graphique : reproductions d'œuvres, photographie d'architecture, tout ce qui comporte des lignes droites nettes ou une typographie fine. Le tissage de la toile adoucit légèrement les détails très fins, ce qui devient un défaut quand le détail est justement l'essentiel.",
        "Les documents, les certificats et tout ce qui comporte du petit texte devraient toujours être encadrés sous verre. La toile est le mauvais support pour du texte.",
        "## Durabilité",
        "Les deux peuvent durer des décennies ; ce qui compte, c'est l'encre et le support, pas le format. Nos toiles utilisent l'encre UVgel Canon Colorado, garantie 30 ans contre la décoloration sous un éclairage intérieur normal.",
        "Les impressions encadrées sont plus vulnérables sur un point précis : si l'impression est faite à l'encre à colorants sur du papier photo standard, elle peut virer en quelques années dans une pièce lumineuse, vitre ou pas. Les impressions pigmentaires sur papier d'archive tiennent aussi bien que la toile.",
        "La toile a un avantage de durabilité qui mérite d'être mentionné : aucune vitre à casser. Si une toile tombe du mur, elle se bosselle au pire. Une grande pièce encadrée qui tombe représente un véritable danger.",
        "## Coût",
        "À format égal, une toile tendue coûte généralement moins cher que l'équivalent encadré, car l'encadrement implique un passe-partout, une vitre, une moulure et de la main-d'œuvre. L'écart se creuse avec la taille : en 36x48, un encadrement sur mesure coûte fréquemment plus cher que l'impression elle-même.",
        "La toile arrive aussi prête à accrocher. Une impression papier exige un passage chez l'encadreur, ce qui représente un coût et un délai faciles à oublier quand on compare des prix en ligne.",
        "## L'option intermédiaire",
        "Le cadre flottant offre les deux. La toile est tendue normalement, puis insérée dans un cadre mince avec un petit espace visible sur le pourtour : elle se lit comme une pièce encadrée finie tout en conservant sa surface mate et sans reflet. Aucune vitre n'intervient.",
        "C'est l'option que nous recommandons le plus souvent pour la photographie de mariage et de famille, quand on souhaite une présentation plus formelle qu'une simple toile galerie sans vouloir de reflets sur un portrait.",
        "## Une règle simple",
        "Si la photographie représente des personnes ou des lieux et que la pièce reçoit une lumière du jour significative, choisissez la toile. Si la pièce est graphique, contient du texte ou constitue une œuvre originale de valeur sur papier, encadrez-la sous verre. Si vous voulez la formalité d'un cadre sans les reflets, optez pour un cadre flottant sur toile.",
      ],
    },
  },
];

export const getPost = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find((p) => p.slug === slug);

/** Newest first. */
export const listPosts = (): BlogPost[] =>
  [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published));
