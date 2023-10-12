import confetti from "canvas-confetti";

export const fireConfetti = () => {
  var end = Date.now() + 8 * 1000;
  let colors: string[] = [];
  colors.push(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--ion-color-primary"
    )
  );
  colors.push(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--ion-color-accent"
    )
  );

  console.log(colors);

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  // seccond animation
  var count = 200;
  var defaults = {
    origin: { y: 0.7 },
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  confetti({
    angle: randomInRange(55, 125),
    spread: randomInRange(50, 70),
    particleCount: randomInRange(50, 100),
    origin: { y: 0.6 },
    colors: colors,
  });
  //   realisticConfetti(colors);

  let intervalCounter = 0;

  const myInterval = setInterval(() => {
    intervalCounter++;
    confetti({
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      particleCount: randomInRange(50, 100),
      origin: { y: 0.6 },
      colors: colors,
    });
    // realisticConfetti(colors);
    if (intervalCounter > 15) {
      clearInterval(myInterval);
    }
  }, 500);
};

const realisticConfetti = (colors: string[]) => {
  var count = 200;
  var defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: confetti.Options | undefined) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: colors,
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
