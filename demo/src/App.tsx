import { showPopup } from '../../src/popup';
import { CanlendarPage } from './pages/Canlendar';
import { CarouselPage } from './pages/Carousel';
import { ComboBoxPage } from './pages/ComboBox';
import { DatePickerPage } from './pages/DatePicker';
import { FormPage } from './pages/Form';

let objects = [];
for (let i = 0; i < 1000000; i++) {
  objects[i] = {};
}

let map = new WeakMap();
let now = performance.now();

for (let i = 0; i < 1000000; i++) {
  map.set(objects[i], i);
}

console.log(performance.now() - now);

const openDropdown = (align: HTMLElement) => {
  const popup = showPopup(() => <div style={{ padding: '100px 0', background: 'silver' }}>11111111111111111111</div>, {
    // align,
    transition: true,
  });
};

export const App = () => {
  let ref;

  return (
    <div style={{ 'min-height': '100%' }}>
      <div style={{ padding: '800px 0' }}>
        <button ref={ref} onclick={() => openDropdown(ref)}>
          click
        </button>
      </div>
      {/* <CarouselPage></CarouselPage>
      <CanlendarPage></CanlendarPage>
      <DatePickerPage></DatePickerPage>
      <ComboBoxPage></ComboBoxPage>
      <FormPage></FormPage> */}
    </div>
  );
};
