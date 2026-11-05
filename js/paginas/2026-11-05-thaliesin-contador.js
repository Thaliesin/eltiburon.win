/* =====================================================================
   CONFIGURACIÓN DEL CONTADOR
   ---------------------------------------------------------------------
   Este es el único fichero que necesitas editar.
   Guarda los cambios y recarga la página (F5).
   ===================================================================== */

window.COUNTDOWN_CONFIG = {

  // Número de días desde donde empieza el contador (cuenta atrás).
  days: 3,

  // Fecha/hora de inicio (opcional).
  //   null  -> el contador empieza la primera vez que se abre la página
  //            y se recuerda en ese navegador.
  //   texto -> fecha fija, formato "AAAA-MM-DDTHH:MM:SS"
  //            ejemplo: "2026-11-05T09:00:00"
  startDate: null,

  // Fecha/hora final exacta (opcional). Si la rellenas, manda sobre
  // "days" y "startDate".  Ejemplo: "2026-12-24T00:00:00"
  endDate: null,

  // ¿Mostrar también las horas?  false = días / minutos / segundos
  showHours: true,

  // Título opcional sobre el contador (déjalo vacío para no mostrarlo).
  title: "",

  // Texto que aparece cuando el contador llega a cero.
  finishedText: "Tiempo cumplido"

};
/* ============================================================
   Lógica del contador. Lee los valores de config.js
   (window.COUNTDOWN_CONFIG). No hace falta tocar este fichero.
   ============================================================ */
(function () {
  "use strict";

  var DEFAULTS = {
    days: 30,
    startDate: null,
    endDate: null,
    showHours: false,
    title: "",
    finishedText: "Tiempo cumplido"
  };

  var cfg = Object.assign({}, DEFAULTS, window.COUNTDOWN_CONFIG || {});
  var DAY_MS = 86400000;

  var el = {
    title:    document.getElementById("title"),
    clock:    document.getElementById("clock"),
    days:     document.getElementById("v-days"),
    hours:    document.getElementById("v-hours"),
    minutes:  document.getElementById("v-minutes"),
    seconds:  document.getElementById("v-seconds"),
    uHours:   document.getElementById("u-hours"),
    sepHours: document.getElementById("sep-hours"),
    finished: document.getElementById("finished"),
    live:     document.getElementById("live")
  };

  /* ---------- utilidades ---------- */

  function parseDate(value) {
    if (!value) return null;
    var t = new Date(value).getTime();
    return isNaN(t) ? null : t;
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  // Guarda/recupera el instante de inicio cuando config.js no fija fecha.
  function rememberedStart(key) {
    var stored = null;
    try { stored = window.localStorage.getItem(key); } catch (e) { /* modo privado */ }

    var t = stored === null ? NaN : parseInt(stored, 10);
    if (!isNaN(t)) return t;

    t = Date.now();
    try { window.localStorage.setItem(key, String(t)); } catch (e) { /* ignorar */ }
    return t;
  }

  /* ---------- cálculo del instante final ---------- */

  function resolveTarget() {
    var end = parseDate(cfg.endDate);
    if (end !== null) return end;

    var days = Number(cfg.days);
    if (!isFinite(days) || days < 0) days = DEFAULTS.days;

    var start = parseDate(cfg.startDate);
    if (start === null) {
      // La clave incluye los días: si cambias config.js, el contador reinicia.
      start = rememberedStart("contador:inicio:" + days);
    }
    return start + days * DAY_MS;
  }

  var target = resolveTarget();

  /* ---------- pintado ---------- */

  if (cfg.title) {
    el.title.textContent = cfg.title;
    el.title.hidden = false;
  }

  if (cfg.showHours) {
    el.uHours.hidden = false;
    el.sepHours.hidden = false;
  }

  var last = "";
  var ended = false;

  function render() {
    var remaining = Math.max(0, target - Date.now());
    var total = Math.floor(remaining / 1000);

    var days = Math.floor(total / 86400);
    var rest = total % 86400;
    var hours = 0;

    if (cfg.showHours) {
      hours = Math.floor(rest / 3600);
      rest = rest % 3600;
    }

    var minutes = Math.floor(rest / 60);
    var seconds = rest % 60;

    var stamp = days + "|" + hours + "|" + minutes + "|" + seconds;
    if (stamp !== last) {
      last = stamp;
      el.days.textContent = String(days);
      el.minutes.textContent = pad(minutes);
      el.seconds.textContent = pad(seconds);
      if (cfg.showHours) el.hours.textContent = pad(hours);

      el.live.textContent = days + " días, " +
        (cfg.showHours ? hours + " horas, " : "") +
        minutes + " minutos y " + seconds + " segundos";
    }

    if (remaining === 0 && !ended) {
      ended = true;
      if (cfg.finishedText) {
        el.finished.textContent = cfg.finishedText;
        el.finished.hidden = false;
      }
      clearInterval(timer);
    }
  }

  render();
  var timer = setInterval(render, 250);

  // Al volver de una pestaña en segundo plano, refrescar al instante.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render();
  });
})();
