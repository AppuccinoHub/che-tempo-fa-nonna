/* Web Speech helpers. A new recognizer is created for every tap (iOS Safari). */
(function (root) {
  "use strict";

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
    const preferred = italian.find(function (voice) {
      return /alice|elsa|federica|silvia|paola|chiara|emma|francesca/i.test(voice.name || "");
    });
    return preferred || italian[0] || null;
  }

  let token = 0;
  const queue = [];
  let pumping = false;

  function cancel() {
    token += 1;
    queue.length = 0;
    pumping = false;
    try {
      if (root.speechSynthesis) root.speechSynthesis.cancel();
    } catch (err) {
      /* ignore */
    }
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
      utterance.rate = 0.9;
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
    utter(item.text, item.token).then(function () {
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

    const wasSpeaking = !!(root.speechSynthesis && root.speechSynthesis.speaking);
    try {
      if (root.speechSynthesis) root.speechSynthesis.cancel();
    } catch (err) {
      /* ignore */
    }

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
