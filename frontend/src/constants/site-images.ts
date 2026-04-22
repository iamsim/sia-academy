/**
 * Local assets in /public/images (Taekwondo photography from Wikimedia Commons).
 * Replace files anytime; check each file’s license on Commons before commercial use.
 */
export const siteImages = {
  heroHome: '/images/hero-home.jpg',
  heroTraining: '/images/hero-training.jpg',
  bgDobok: '/images/bg-dobok.jpg',
  bgCommunity: '/images/bg-community.jpg',
  gallery: [
    { file: 'gallery-01.jpg', caption: 'Basics: stance and fundamentals in the dojang' },
    { file: 'gallery-02.jpg', caption: 'Olympic Taekwondo — elite kyorugi competition' },
    { file: 'gallery-03.jpg', caption: 'Class training: kicks and movement on the mat' },
    { file: 'gallery-04.jpg', caption: 'Partner work and timing in Taekwondo class' },
    { file: 'gallery-05.jpg', caption: 'International match — World Championship action' },
    { file: 'gallery-06.jpg', caption: 'Multi-nation event — Taekwondo at the Games' },
  ],
} as const

export function galleryImageSrc(file: string) {
  return `/images/${file}`
}
