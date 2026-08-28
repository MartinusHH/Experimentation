// De schuifpuzzel. Van de foto van je eigen dier — geen gegenereerd plaatje,
// dus geen wachttijd en geen internet nodig.
//
// Belangrijk detail: door willekeurig te schudden vanuit de opgeloste stand
// (in plaats van de tegels te husselen) is de puzzel altijd oplosbaar.

export class Schuifpuzzel {
  constructor(element, { maat = 3, opGewonnen = () => {}, opZet = () => {} } = {}) {
    this.el = element;
    this.maat = maat;
    this.opGewonnen = opGewonnen;
    this.opZet = opZet;
    this.zetten = 0;
    this.gewonnen = false;
    this.tegels = [];
    this.el.addEventListener('click', (e) => {
      const knop = e.target.closest('[data-index]');
      if (knop) this.klik(Number(knop.dataset.index));
    });
    this.el.addEventListener('keydown', (e) => {
      const pijlen = { ArrowUp: 'omhoog', ArrowDown: 'omlaag', ArrowLeft: 'links', ArrowRight: 'rechts' };
      if (pijlen[e.key]) { e.preventDefault(); this.schuifMetToets(pijlen[e.key]); }
    });
  }

  get leeg() { return this.maat * this.maat - 1; }

  start(afbeelding, maat = this.maat) {
    this.maat = maat;
    this.afbeelding = afbeelding;
    this.zetten = 0;
    this.gewonnen = false;
    this.tegels = Array.from({ length: maat * maat }, (_, i) => i);
    this.schud();
    this.teken();
  }

  schud() {
    const n = this.maat;
    let leegIdx = this.tegels.indexOf(this.leeg);
    let vorige = -1;
    for (let i = 0; i < n * n * 20; i++) {
      const rij = Math.floor(leegIdx / n);
      const kol = leegIdx % n;
      const buren = [];
      if (rij > 0) buren.push(leegIdx - n);
      if (rij < n - 1) buren.push(leegIdx + n);
      if (kol > 0) buren.push(leegIdx - 1);
      if (kol < n - 1) buren.push(leegIdx + 1);
      const keuze = buren.filter((b) => b !== vorige);
      const doel = (keuze.length ? keuze : buren)[Math.floor(Math.random() * (keuze.length || buren.length))];
      [this.tegels[leegIdx], this.tegels[doel]] = [this.tegels[doel], this.tegels[leegIdx]];
      vorige = leegIdx;
      leegIdx = doel;
    }
    // Heel kleine kans dat het schudden precies weer de oplossing geeft.
    if (this.klaar()) this.schud();
  }

  klaar() { return this.tegels.every((w, i) => w === i); }

  buurVanLeeg(index) {
    const n = this.maat;
    const leegIdx = this.tegels.indexOf(this.leeg);
    const rij = Math.floor(index / n); const kol = index % n;
    const lRij = Math.floor(leegIdx / n); const lKol = leegIdx % n;
    return (Math.abs(rij - lRij) === 1 && kol === lKol) || (Math.abs(kol - lKol) === 1 && rij === lRij);
  }

  klik(index) {
    if (this.gewonnen || !this.buurVanLeeg(index)) return;
    const leegIdx = this.tegels.indexOf(this.leeg);
    [this.tegels[index], this.tegels[leegIdx]] = [this.tegels[leegIdx], this.tegels[index]];
    this.zetten++;
    this.opZet(this.zetten);
    this.teken();
    if (this.klaar()) {
      this.gewonnen = true;
      this.teken();
      this.opGewonnen(this.zetten);
    }
  }

  // Met de pijltjestoetsen schuif je de tegel die in die richting ligt.
  schuifMetToets(richting) {
    const n = this.maat;
    const leegIdx = this.tegels.indexOf(this.leeg);
    const rij = Math.floor(leegIdx / n); const kol = leegIdx % n;
    let doel = null;
    if (richting === 'omhoog' && rij < n - 1) doel = leegIdx + n;
    if (richting === 'omlaag' && rij > 0) doel = leegIdx - n;
    if (richting === 'links' && kol < n - 1) doel = leegIdx + 1;
    if (richting === 'rechts' && kol > 0) doel = leegIdx - 1;
    if (doel !== null) this.klik(doel);
  }

  teken() {
    const n = this.maat;
    const deel = 100 / n;
    this.el.style.setProperty('--maat', n);
    this.el.innerHTML = this.tegels.map((waarde, index) => {
      const leeg = waarde === this.leeg && !this.gewonnen;
      const bronRij = Math.floor(waarde / n);
      const bronKol = waarde % n;
      const rij = Math.floor(index / n);
      const kol = index % n;
      const pos = n === 1 ? '0% 0%' : `${(bronKol * 100) / (n - 1)}% ${(bronRij * 100) / (n - 1)}%`;
      const beweegbaar = !leeg && !this.gewonnen && this.buurVanLeeg(index);
      return `<button type="button" class="tegel${leeg ? ' tegel--leeg' : ''}" data-index="${index}"
        ${leeg ? 'tabindex="-1" aria-hidden="true"' : ''}
        aria-label="Tegel ${waarde + 1}${beweegbaar ? ', kan schuiven' : ''}"
        style="width:${deel}%;height:${deel}%;left:${kol * deel}%;top:${rij * deel}%;
        background-image:url(${this.afbeelding});background-size:${n * 100}% ${n * 100}%;background-position:${pos}"></button>`;
    }).join('');
  }
}
