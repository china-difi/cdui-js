import { CanlendarPage } from './pages/Canlendar';
import { CarouselPage } from './pages/Carousel';
import { ComboBoxPage } from './pages/ComboBox';
import { DatePickerPage } from './pages/DatePicker';
import { FormPage } from './pages/Form';
import { MobileDatePickerPage } from './pages/MobileDatePicker';

export const App = () => {
  return (
    <div style={{ 'min-height': '100%' }}>
      <CarouselPage></CarouselPage>
      <CanlendarPage></CanlendarPage>
      <DatePickerPage></DatePickerPage>
      <MobileDatePickerPage></MobileDatePickerPage>
      <ComboBoxPage></ComboBoxPage>
      <FormPage></FormPage>
    </div>
  );
};
