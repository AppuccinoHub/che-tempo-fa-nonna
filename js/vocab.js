/* Novice Level 1 weather phrases for Che tempo fa, Nonna? */
(function (root) {
  "use strict";

  const cards = [
    {
      id: "sunny",
      kind: "weather",
      scene: "sunny",
      english: "It's sunny — nice weather.",
      ask: "Guarda fuori!",
      variants: [
        { say: "C’è il sole.", phonetic: "cheh eel SO-leh" },
        { say: "Fa bel tempo.", phonetic: "fah bel TEM-poh" }
      ],
      accept: [
        "c'è il sole",
        "ce il sole",
        "c'è sole",
        "ce sole",
        "che il sole",
        "che sole",
        "il sole",
        "sole",
        "fa sole",
        "fa bel tempo",
        "bel tempo",
        "fa bello",
        "che bel tempo",
        "che bello",
        "c'è bel tempo"
      ],
      why: "C’è il sole means “there is the sun.” Fa bel tempo means the weather is lovely. Either one is right on a bright day.",
      distractors: ["Piove.", "È nuvoloso.", "Fa freddo."]
    },
    {
      id: "rain",
      kind: "weather",
      scene: "rain",
      english: "It's raining.",
      ask: "Guarda fuori!",
      variants: [{ say: "Piove.", phonetic: "PYOH-veh" }],
      accept: ["piove", "sta piovendo", "sta a piovere", "pioviggina", "piove giù"],
      why: "Piove is a whole sentence by itself: “it’s raining.” It comes from piovere, to rain.",
      distractors: ["Nevica.", "C’è il sole.", "È nuvoloso."]
    },
    {
      id: "snow",
      kind: "weather",
      scene: "snow",
      english: "It's snowing.",
      ask: "Guarda fuori!",
      variants: [{ say: "Nevica.", phonetic: "NEH-vee-kah" }],
      accept: ["nevica", "sta nevicando", "neve"],
      why: "Nevica means it’s snowing. The noun for snow is neve.",
      distractors: ["Piove.", "C’è la nebbia.", "Fa freddo."]
    },
    {
      id: "hot",
      kind: "weather",
      scene: "hot",
      english: "It's hot.",
      ask: "Guarda fuori!",
      variants: [{ say: "Fa caldo.", phonetic: "fah KAL-doh" }],
      accept: ["fa caldo", "fa molto caldo", "fa tanto caldo", "fa un caldo", "che caldo", "caldo"],
      why: "Italians say the weather “makes” hot: fa caldo. Caldo means hot.",
      distractors: ["Fa freddo.", "Nevica.", "Piove."]
    },
    {
      id: "cold",
      kind: "weather",
      scene: "cold",
      english: "It's cold.",
      ask: "Guarda fuori!",
      variants: [{ say: "Fa freddo.", phonetic: "fah FRED-doh" }],
      accept: ["fa freddo", "fa molto freddo", "che freddo", "freddo"],
      why: "Same pattern as fa caldo. Freddo means cold, so fa freddo is “it’s cold.”",
      distractors: ["Fa caldo.", "C’è il sole.", "Piove."]
    },
    {
      id: "cloudy",
      kind: "weather",
      scene: "cloudy",
      english: "It's cloudy.",
      ask: "Guarda fuori!",
      variants: [{ say: "È nuvoloso.", phonetic: "eh noo-voh-LOH-zoh" }],
      accept: [
        "è nuvoloso",
        "e nuvoloso",
        "nuvoloso",
        "nuvolosa",
        "è annuvolato",
        "annuvolato",
        "ci sono le nuvole",
        "ci sono nuvole",
        "le nuvole"
      ],
      why: "Nuvola means cloud. Nuvoloso means cloudy, and è is simply “is.”",
      distractors: ["C’è la nebbia.", "C’è il sole.", "Piove."]
    },
    {
      id: "wind",
      kind: "weather",
      scene: "wind",
      english: "It's windy.",
      ask: "Guarda fuori!",
      variants: [
        { say: "C’è vento.", phonetic: "cheh VEN-toh" },
        { say: "Tira vento.", phonetic: "TEE-rah VEN-toh" }
      ],
      accept: [
        "c'è vento",
        "ce vento",
        "che vento",
        "c'è del vento",
        "tira vento",
        "tira il vento",
        "vento",
        "ventoso",
        "è ventoso",
        "fa vento"
      ],
      why: "Vento is wind. C’è vento means there is wind. Tira vento means the wind is pulling — it’s blowing.",
      distractors: ["C’è un temporale.", "È nuvoloso.", "Fa caldo."]
    },
    {
      id: "fog",
      kind: "weather",
      scene: "fog",
      english: "It's foggy.",
      ask: "Guarda fuori!",
      variants: [{ say: "C’è la nebbia.", phonetic: "cheh lah NEB-byah" }],
      accept: ["c'è la nebbia", "c'è nebbia", "ce la nebbia", "la nebbia", "nebbia", "che nebbia"],
      why: "Nebbia is fog. C’è la nebbia — there’s fog, the kind that sits low in the morning.",
      distractors: ["È nuvoloso.", "Piove.", "Nevica."]
    },
    {
      id: "storm",
      kind: "weather",
      scene: "storm",
      english: "There's a thunderstorm.",
      ask: "Guarda fuori!",
      variants: [
        { say: "C’è un temporale.", phonetic: "cheh oon tem-poh-RAH-leh" },
        { say: "Temporale.", phonetic: "tem-poh-RAH-leh" }
      ],
      accept: [
        "temporale",
        "un temporale",
        "c'è un temporale",
        "c'è il temporale",
        "c'è temporale",
        "che temporale",
        "il temporale"
      ],
      why: "A temporale is a thunderstorm — louder and wilder than plain rain (piove).",
      distractors: ["Piove.", "C’è vento.", "È nuvoloso."]
    },
    {
      id: "sent-rain",
      kind: "sentence",
      scene: "rain",
      english: "Tell her: Grandma, it's raining today!",
      ask: "Dimmi tutto!",
      variants: [{ say: "Nonna, oggi piove!", phonetic: "NON-nah OH-jee PYOH-veh" }],
      accept: [
        "nonna oggi piove",
        "oggi piove",
        "nonna piove oggi",
        "oggi nonna piove",
        "nonna oggi sta piovendo"
      ],
      why: "Oggi means today. You said her name, then the weather — a real little sentence.",
      distractors: ["Nonna, fa caldo!", "Che tempo fa da te?", "Nevica."]
    },
    {
      id: "sent-hot",
      kind: "sentence",
      scene: "hot",
      english: "Tell her: Grandma, it's hot!",
      ask: "Dimmi tutto!",
      variants: [{ say: "Nonna, fa caldo!", phonetic: "NON-nah fah KAL-doh" }],
      accept: [
        "nonna fa caldo",
        "nonna oggi fa caldo",
        "fa caldo nonna",
        "oggi fa caldo nonna",
        "nonna fa molto caldo"
      ],
      why: "Starting with Nonna gets her attention. Then fa caldo does the rest.",
      distractors: ["Nonna, oggi piove!", "Che tempo fa da te?", "Fa freddo."]
    },
    {
      id: "sent-ask",
      kind: "sentence",
      scene: "sunny",
      english: "Ask what the weather is like where she is.",
      ask: "Chiedimi del tempo!",
      variants: [{ say: "Che tempo fa da te?", phonetic: "keh TEM-poh fah dah teh" }],
      accept: [
        "che tempo fa da te",
        "che tempo fa da te nonna",
        "nonna che tempo fa da te",
        "che tempo fa lì",
        "che tempo fa li",
        "come è il tempo da te",
        "com'è il tempo da te",
        "che tempo c'è da te",
        "che tempo ce da te"
      ],
      why: "Da te means “where you are.” Che tempo fa da te? asks what the weather is like on her side.",
      distractors: ["Nonna, oggi piove!", "C’è il sole.", "Fa caldo."]
    },
    {
      id: "bye",
      kind: "goodbye",
      scene: "kitchen",
      english: "Say goodbye, and tell her you love her.",
      ask: "Mi saluti?",
      variants: [{ say: "Ciao ciao, Nonna! Ti voglio bene!", phonetic: "CHOW chow, NON-nah! tee VOHL-yoh BEH-neh" }],
      accept: [
        "ciao ciao nonna ti voglio bene",
        "ciao ciao ti voglio bene",
        "ciao nonna ti voglio bene",
        "nonna ti voglio bene",
        "ti voglio bene",
        "ti voglio tanto bene",
        "ti voglio bene nonna",
        "ti voglio un mondo di bene"
      ],
      why: "Ti voglio bene is how family says “I love you.” Ciao ciao is the double goodbye that means you mean it.",
      distractors: ["Buonanotte, Nonna", "Grazie, Nonna", "A domani, Nonna"]
    }
  ];

  root.NONNA_VOCAB = { cards: cards };
})(typeof globalThis !== "undefined" ? globalThis : this);
