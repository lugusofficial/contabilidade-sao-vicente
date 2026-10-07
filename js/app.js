// Agenda de obrigações por regime e reveal on scroll.
// Progressive: a página é completa sem este arquivo.
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Agenda: o regime escolhido troca a lista e a mensagem do WhatsApp. */
  function agenda() {
    var picker = document.querySelector('[data-regime]');
    var list = document.querySelector('[data-agenda-list]');
    var send = document.querySelector('[data-agenda-send]');
    if (!picker || !list || !send) { return; }

    var REGIMES = {
      mei: {
        rotulo: 'MEI',
        itens: [
          ['Dia 20', 'DAS do MEI, a guia mensal'],
          ['Mensal', 'Relatório de receita bruta do mês'],
          ['Maio', 'Declaração anual do MEI'],
          ['Quando exigida', 'Emissão de nota fiscal de serviço']
        ]
      },
      simples: {
        rotulo: 'Simples Nacional',
        itens: [
          ['Dia 7', 'FGTS da folha de pagamento'],
          ['Dia 20', 'DAS do Simples Nacional'],
          ['Dia 20', 'INSS retido da folha'],
          ['Mensal', 'Envio de notas e extratos ao escritório'],
          ['Março', 'Declaração anual de informações, a DEFIS']
        ]
      },
      presumido: {
        rotulo: 'Lucro Presumido',
        itens: [
          ['Dia 7', 'FGTS da folha de pagamento'],
          ['Dia 15', 'DCTFWeb da competência'],
          ['Dia 25', 'PIS e COFINS'],
          ['Trimestral', 'IRPJ e CSLL apurados no trimestre'],
          ['Conforme a atividade', 'ICMS ou ISS do município']
        ]
      }
    };

    var base = send.getAttribute('href').split('?')[0];

    function select(key) {
      var regime = REGIMES[key];
      if (!regime) { return; }

      list.textContent = '';
      var fresh = [];
      regime.itens.forEach(function (item, i) {
        var li = document.createElement('li');
        if (!reduced) {
          li.style.transitionDelay = i * 45 + 'ms';
          li.style.opacity = '0';
          li.style.transform = 'translateY(8px)';
          fresh.push(li);
        }

        var quando = document.createElement('span');
        quando.className = 'agenda__when';
        quando.textContent = item[0];

        var oque = document.createElement('span');
        oque.className = 'agenda__what';
        oque.textContent = item[1];

        li.appendChild(quando);
        li.appendChild(oque);
        list.appendChild(li);
      });

      if (fresh.length) {
        window.requestAnimationFrame(function () {
          fresh.forEach(function (li) {
            li.style.opacity = '';
            li.style.transform = '';
          });
        });
      }

      var message = [
        'Olá! Quero falar sobre a contabilidade da minha empresa.',
        'Regime: ' + regime.rotulo
      ].join('\n');
      send.setAttribute('href', base + '?text=' + encodeURIComponent(message));
    }

    picker.addEventListener('change', function () { select(picker.value); });
    select(picker.value);
  }

  /* Reveal on scroll. Sem script a página aparece inteira, então isto é aditivo. */
  function reveal() {
    if (reduced || !('IntersectionObserver' in window)) { return; }

    var targets = [].slice.call(document.querySelectorAll('.hero__text, .hero__media, .section > .container'));
    if (!targets.length) { return; }

    document.documentElement.classList.add('js-reveal');

    targets.forEach(function (target) {
      target.setAttribute('data-reveal', '');
      if (target.classList.contains('hero__media')) {
        target.setAttribute('data-reveal-delay', '1');
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (target) { observer.observe(target); });
  }

  /* Hero: alternância lenta entre as imagens, sem controles.
     Não inicia sob prefers-reduced-motion, e sem script a primeira imagem fica fixa. */
  function heroFade() {
    if (reduced) { return; }
    var stage = document.querySelector('[data-fade]');
    if (!stage) { return; }
    var frames = [].slice.call(stage.querySelectorAll('img'));
    if (frames.length < 2) { return; }

    var index = 0;
    stage.classList.add('is-fading');
    frames[0].classList.add('is-current');

    var timer = null;
    function step() {
      frames[index].classList.remove('is-current');
      index = (index + 1) % frames.length;
      frames[index].classList.add('is-current');
    }
    function start() {
      if (timer === null) { timer = window.setInterval(step, 6500); }
    }
    function stop() {
      if (timer !== null) { window.clearInterval(timer); timer = null; }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { start(); } else { stop(); }
        });
      }, { threshold: 0 }).observe(stage);
    } else {
      start();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });
  }

  reveal();
  agenda();
  heroFade();
})();
