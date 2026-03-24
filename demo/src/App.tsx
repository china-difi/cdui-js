import { CanlendarPage } from './pages/Canlendar';
import { ComboBoxPage } from './pages/ComboBox';
import { DatePickerPage } from './pages/DatePicker';
import { FormPage } from './pages/Form';

export const App = () => {
  return (
    <div style={{ 'min-height': '100%' }}>
      <CanlendarPage></CanlendarPage>
      <DatePickerPage></DatePickerPage>
      <ComboBoxPage></ComboBoxPage>
      <FormPage></FormPage>
    </div>
  );
};
