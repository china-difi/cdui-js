import { Carousel, CarouselApi, CarouselButtons } from '../../../src/components/Carousel';

const carousels = [
  {
    text: '页面1',
  },
  {
    text: '页面2',
  },
  {
    text: '页面3',
  },
  {
    text: '页面4',
  },
];

export const CarouselPage = () => {
  let carousel: CarouselApi;

  return (
    <div class="relative">
      <Carousel
        class="row-gap"
        api={(api) => (carousel = api)}
        each={carousels}
        disabledScroll={true}
        autoplay={false}
        style={{ width: '100%', height: '200px' }}
      >
        {(item) => (
          <div class="border round" style={{ flex: 'none', width: '100%', height: '100%', 'margin-right': '4px' }}>
            {item.text}
          </div>
        )}
      </Carousel>
      <CarouselButtons carousel={carousel}></CarouselButtons>
    </div>
  );
};
