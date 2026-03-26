import { batch, createEffect, omitProps, pickProps, reactive } from '../../src/reactive';
import { Icon } from '../../src/components/Icon';
import { CanlendarPage } from './pages/Canlendar';
import { ComboBoxPage } from './pages/ComboBox';
import { DatePickerPage } from './pages/DatePicker';
import { FormPage } from './pages/Form';
import { MobileDatePickerPage } from './pages/MobileDatePicker';
import { TextBox } from '../../src/components/TextBox';

const Test = (props: { text1: string; text2: string }) => {
  let dom: HTMLElement;
  return (
    <div>
      <div>{pickProps(props, ['text1']).text1}</div>
      <div>{omitProps(props, ['text1']).text2}</div>
      <TextBox ref={dom as any}></TextBox>
    </div>
  );
};

export const App = () => {
  let state = reactive({
    text1: '111',
    text2: '222',
  });

  createEffect(() => {
    console.log(state.text1, state.text2);
  });

  return (
    <div style={{ 'min-height': '100%' }}>
      <Icon name="dropdown" class="test" onclick={() => alert(1111)} style={{ background: 'red' }}></Icon>
      <Test text1={state.text1} text2={state.text2}></Test>
      <button onclick={() => batch(() => (state.text1 = state.text2 = '' + Math.random()))}>click</button>
      <CanlendarPage></CanlendarPage>
      <DatePickerPage></DatePickerPage>
      <MobileDatePickerPage></MobileDatePickerPage>
      <ComboBoxPage></ComboBoxPage>
      <FormPage></FormPage>
    </div>
  );
};
