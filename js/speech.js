/* Nonna's voice: recorded Italian clips first, Web Speech only if a clip is missing. */
(function (root) {
  "use strict";

  /* Keys match clipKey(): lowercase, straight apostrophes, punctuation dropped. */
  const CLIPS = {
    "guarda fuori": "audio/guarda-fuori.mp3",
    "dimmi tutto": "audio/dimmi-tutto.mp3",
    "chiedimi del tempo": "audio/chiedimi-del-tempo.mp3",
    "mi saluti": "audio/mi-saluti.mp3",
    "c'è il sole": "audio/ce-il-sole.mp3",
    "fa bel tempo": "audio/fa-bel-tempo.mp3",
    piove: "audio/piove.mp3",
    nevica: "audio/nevica.mp3",
    "fa caldo": "audio/fa-caldo.mp3",
    "fa freddo": "audio/fa-freddo.mp3",
    "è nuvoloso": "audio/e-nuvoloso.mp3",
    "c'è vento": "audio/ce-vento.mp3",
    "tira vento": "audio/tira-vento.mp3",
    "c'è la nebbia": "audio/ce-la-nebbia.mp3",
    "c'è un temporale": "audio/ce-un-temporale.mp3",
    temporale: "audio/temporale.mp3",
    "nonna oggi piove": "audio/nonna-oggi-piove.mp3",
    "nonna fa caldo": "audio/nonna-fa-caldo.mp3",
    "che tempo fa da te": "audio/che-tempo-fa-da-te.mp3",
    "ciao ciao nonna ti voglio bene": "audio/ciao-ciao-nonna.mp3",
    bravissima: "audio/bravissima.mp3",
    "esatto tesoro": "audio/esatto-tesoro.mp3",
    perfetto: "audio/perfetto.mp3",
    "proprio così": "audio/proprio-cosi.mp3",
    benissimo: "audio/benissimo.mp3",
    "anch'io ti voglio bene": "audio/anchio-ti-voglio-bene.mp3",
    "ora lo sai": "audio/ora-lo-sai.mp3",
    "quasi tesoro": "audio/quasi-tesoro.mp3",
    "ci sei quasi": "audio/ci-sei-quasi.mp3",
    "non proprio amore": "audio/non-proprio-amore.mp3",
    "ciao arianna": "audio/ciao-arianna.mp3",
    "ciao tesoro": "audio/ciao-tesoro.mp3"
  };

  function clipKey(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[’‘ʼ]/g, "'")
      .replace(/[^a-zàèéìòóù']+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  let player = null;

  function audioEl() {
    if (!player) {
      player = new Audio();
      player.preload = "auto";
      player.setAttribute("playsinline", "");
      player.playsInline = true;
    }
    return player;
  }

  function stopAudio() {
    if (!player) return;
    try {
      player.pause();
    } catch (err) {
      /* ignore */
    }
  }

  function supported() {
    return !!(root.SpeechRecognition || root.webkitSpeechRecognition);
  }

  function prime() {
    try {
      if (root.speechSynthesis) root.speechSynthesis.getVoices();
    } catch (err) {
      /* ignore */
    }
  }

  function pickVoice() {
    if (!root.speechSynthesis) return null;
    let voices = [];
    try {
      voices = root.speechSynthesis.getVoices() || [];
    } catch (err) {
      return null;
    }
    const italian = voices.filter(function (voice) {
      return /^it([-_]|$)/i.test(voice.lang || "");
    });
    const female = italian.filter(function (voice) {
      return !/diego|luca|paolo|giorgio|cosimo|marco|matteo|giuseppe|carlo|enrico|piero|davide|eddy/i.test(voice.name || "");
    });
    const pool = female.length ? female : italian;
    const preferred = pool.find(function (voice) {
      return /elsa|isabella|alice|alessia|elena|silvia|paola|chiara|francesca|federica|emma|flo/i.test(voice.name || "");
    });
    return preferred || pool[0] || null;
  }

  let token = 0;
  const queue = [];
  let pumping = false;

  function cancel() {
    token += 1;
    queue.length = 0;
    pumping = false;
    stopAudio();
    try {
      if (root.speechSynthesis) root.speechSynthesis.cancel();
    } catch (err) {
      /* ignore */
    }
  }

  function playClip(url, myToken) {
    return new Promise(function (resolve) {
      if (!url || myToken !== token) {
        resolve("skipped");
        return;
      }
      const audio = audioEl();
      let settled = false;
      const finish = function (status) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("error", onErr);
        audio.removeEventListener("pause", onPause);
        resolve(status);
      };
      const onEnd = function () {
        finish(myToken === token ? "played" : "skipped");
      };
      const onErr = function () {
        finish("failed");
      };
      const onPause = function () {
        if (myToken !== token) finish("skipped");
      };
      const timer = setTimeout(function () {
        finish(myToken === token ? "played" : "skipped");
      }, 15000);
      audio.addEventListener("ended", onEnd);
      audio.addEventListener("error", onErr);
      audio.addEventListener("pause", onPause);
      audio.src = url;
      let started;
      try {
        started = audio.play();
      } catch (err) {
        finish("failed");
        return;
      }
      if (started && started.catch) {
        started.catch(function () {
          finish("failed");
        });
      }
    });
  }

  function utter(text, myToken) {
    return new Promise(function (resolve) {
      if (!root.speechSynthesis || !text || myToken !== token) {
        resolve();
        return;
      }
      let settled = false;
      const done = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      };
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "it-IT";
      utterance.rate = 0.86;
      utterance.pitch = 0.84;
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = done;
      utterance.onerror = done;
      const timer = setTimeout(done, Math.min(9000, 1600 + text.length * 70));
      try {
        root.speechSynthesis.resume();
        root.speechSynthesis.speak(utterance);
      } catch (err) {
        done();
      }
    });
  }

  function speakOne(text, myToken) {
    const url = CLIPS[clipKey(text)];
    if (!url) return utter(text, myToken);
    return playClip(url + "?v=hub1", myToken).then(function (status) {
      if (status === "failed" && myToken === token) return utter(text, myToken);
    });
  }

  function pump() {
    if (pumping) return;
    const item = queue[0];
    if (!item) return;
    if (item.token !== token) {
      queue.shift();
      item.resolve();
      pump();
      return;
    }
    pumping = true;
    speakOne(item.text, item.token).then(function () {
      pumping = false;
      if (queue[0] === item) queue.shift();
      item.resolve();
      pump();
    });
  }

  function speak(text) {
    if (!text) return Promise.resolve();
    return new Promise(function (resolve) {
      queue.push({ text: text, resolve: resolve, token: token });
      pump();
    });
  }

  function listen(handlers) {
    const Ctor = root.SpeechRecognition || root.webkitSpeechRecognition;
    if (!Ctor) {
      handlers.onError && handlers.onError("unsupported");
      return { stop: function () {}, abort: function () {} };
    }

    let dead = false;
    let rec = null;
    let settled = false;
    const finish = function (fn) {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      fn();
    };

    const wasSpeaking = !!(
      (root.speechSynthesis && root.speechSynthesis.speaking) ||
      (player && !player.paused)
    );
    cancel();

    const watchdog = setTimeout(function () {
      try {
        if (rec) rec.abort();
      } catch (err) {
        /* ignore */
      }
      finish(function () {
        handlers.onError && handlers.onError("timeout");
      });
    }, 12000);

    const startTimer = setTimeout(function () {
      if (dead) return;
      rec = new Ctor();
      rec.lang = "it-IT";
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 5;

      rec.onresult = function (event) {
        let interim = "";
        let finalText = "";
        const alts = [];
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
            for (let j = 0; j < result.length; j++) alts.push(result[j].transcript);
          } else {
            interim += result[0].transcript;
          }
        }
        if (interim && handlers.onPartial) handlers.onPartial(interim);
        if (finalText && handlers.onFinal) handlers.onFinal(finalText, alts);
      };

      rec.onerror = function (event) {
        const code = (event && event.error) || "error";
        if (code === "aborted") {
          finish(function () {});
          return;
        }
        finish(function () {
          handlers.onError && handlers.onError(code);
        });
      };

      rec.onend = function () {
        finish(function () {
          handlers.onEnd && handlers.onEnd();
        });
      };

      try {
        rec.start();
      } catch (err) {
        finish(function () {
          handlers.onError && handlers.onError("start");
        });
      }
    }, wasSpeaking ? 180 : 40);

    return {
      stop: function () {
        dead = true;
        clearTimeout(startTimer);
        try {
          if (rec) rec.stop();
        } catch (err) {
          /* ignore */
        }
      },
      abort: function () {
        dead = true;
        clearTimeout(startTimer);
        clearTimeout(watchdog);
        settled = true;
        try {
          if (rec) rec.abort();
        } catch (err) {
          /* ignore */
        }
      }
    };
  }

  if (root.speechSynthesis) {
    try {
      root.speechSynthesis.addEventListener("voiceschanged", prime);
    } catch (err) {
      /* ignore */
    }
  }

  root.NonnaSpeech = {
    supported: supported,
    prime: prime,
    speak: speak,
    cancel: cancel,
    listen: listen
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
