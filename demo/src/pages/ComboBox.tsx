import { reactive } from '../../../src/reactive';
import { PopupApi } from '../../../src/popup';
import { ComboBox } from '../../../src/components/ComboBox';

export const ComboBoxPage = () => {
  let combobox: PopupApi;

  const state = reactive({
    value: '111',
  });

  return (
    <ComboBox
      value={state.value}
      api={(api) => (combobox = api)}
      popup={() => (
        <div
          style={{ width: '200px', padding: '8px 0' }}
          onclick={(event) => {
            state.value = event.target.textContent;
            combobox.closePopup();
          }}
        >
          <div>111</div>
          <div>222</div>
        </div>
      )}
    ></ComboBox>
  );
};
