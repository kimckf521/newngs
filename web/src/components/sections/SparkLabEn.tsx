import { ImageCarousel } from './ImageCarousel';

export function SparkLabEn() {
  const images = [
    { src: '/static/img/inspires/lab1.png' },
    { src: '/static/img/inspires/lab2.jpg' },
    { src: '/static/img/inspires/lab3.png' },
    { src: '/static/img/inspires/lab4.png' },
    { src: '/static/img/inspires/lab5.png' },
    { src: '/static/img/inspires/lab6.jpg' },
    { src: '/static/img/inspires/lab7.jpg' },
    { src: '/static/img/inspires/lab8.jpg' },
  ];

  return (
    <section className="connect-to-parents__gradient-bg section-font-style">
      <div className="connect-to-parents__flex-col">
        <h2 className="section_title connect-to-parents__text-center">SPARK LAB</h2>
        <div className="connect-to-parents__grid-cols">
          <ImageCarousel id="carousellabEn" images={images} />
          <div className="connect-to-parents__flex-center">
            <div className="connect-to-parents__bg-white">
              <p className="section_paragraph connect-to-parents__style-1">
                <strong>NGS Global Youth Network</strong>
              </p>
              <p className="section_paragraph connect-to-parents__style-2">
                The SPARK LAB is an interactive platform connecting Global K-12 students to collaborate, innovate, and create.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
