import { reactive } from '../../../src';
import { ComboBox } from '../../../src/components/ComboBox';

export const ComboBoxPage = () => {
  let combobox;

  const state = reactive({
    value: '111',
  });

  return (
    <ComboBox
      api={(api) => (combobox = api)}
      value={state.value}
      popup={{
        style: { width: '200px', padding: '8px 0' },
        onclick: (event) => {
          state.value = event.target.textContent;
          combobox.closePopup();
        },
      }}
    >
      <div>111</div>
      <div>222</div>
    </ComboBox>
  );
};
