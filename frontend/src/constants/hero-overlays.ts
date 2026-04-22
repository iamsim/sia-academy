/**
 * Gradient scrims over photography — lower alpha = more of the image shows through.
 * Tuned for Taekwondo mats and bright uniforms; pair important headings with `readableOnPhoto` shadow.
 */
export const heroOverlays = {
  homeHero:
    'linear-gradient(115deg, rgba(238, 249, 255, 0.55) 0%, rgba(255, 255, 255, 0.35) 42%, rgba(255, 244, 242, 0.48) 100%)',
  homeCta:
    'linear-gradient(180deg, rgba(248, 249, 250, 0.48) 0%, rgba(248, 249, 250, 0.58) 100%)',
  galleryHeader:
    'linear-gradient(135deg, rgba(238, 249, 255, 0.52) 0%, rgba(255, 255, 255, 0.36) 55%, rgba(255, 244, 242, 0.44) 100%)',
  aboutHeader:
    'linear-gradient(100deg, rgba(255, 255, 255, 0.55) 0%, rgba(238, 249, 255, 0.38) 55%, rgba(255, 244, 242, 0.36) 100%)',
  eventsHeader:
    'linear-gradient(120deg, rgba(238, 249, 255, 0.5) 0%, rgba(255, 255, 255, 0.34) 50%, rgba(255, 244, 242, 0.42) 100%)',
  login:
    'linear-gradient(135deg, rgba(248, 250, 252, 0.48) 0%, rgba(238, 249, 255, 0.34) 45%, rgba(255, 244, 242, 0.38) 100%)',
} as const

/** Soft halo so headings stay legible when scrims are light */
export const readableOnPhoto = {
  textShadow: '0 0 22px rgba(255, 255, 255, 0.95), 0 1px 2px rgba(0, 0, 0, 0.12)',
} as const
