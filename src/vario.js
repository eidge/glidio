class Vario {
  constructor() {
    this.vSpeed = 0;
    this.initialFreq = 500;

    this.audioContext = new AudioContext();
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.frequency.setValueAtTime(this.initialFreq, this.audioContext.currentTime, 0)
    this.gain = this.audioContext.createGain();

    this.gain.gain.setValueAtTime(0, this.audioContext.currentTime, 0);

    this.oscillator.connect(this.gain);
    this.gain.connect(this.audioContext.destination);
    this.oscillator.start()

    this._on();
  }

  update(vSpeed) {
    this.vSpeed = this._movingAverage(this.vSpeed, vSpeed)
  }

  _movingAverage(currentValue, nextValue) {
    return currentValue + (nextValue - currentValue) * 0.018;
  }

  _on() {
    let volume = 0;
    if (this.vSpeed > 0.2) { volume = 1; }
    this.gain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    this.oscillator.frequency.setTargetAtTime(this.initialFreq + this.vSpeed * 300, this.audioContext.currentTime, 0.1)
    setTimeout(this._off.bind(this), Math.max(500 - this.vSpeed * 100, 50))
  }


  _off() {
    this.gain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.01);
    setTimeout(this._on.bind(this), Math.max(500 - this.vSpeed * 100, 20))
  }
}
