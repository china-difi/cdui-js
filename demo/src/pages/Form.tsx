import { reactive } from '../../../src/reactive';
import { For } from '../../../src/components/For';
import { TextBox } from '../../../src/components/TextBox';
import { ComboBox } from '../../../src/components/ComboBox';
import { Form, FormApi, FormItem, ValidateRules } from '../../../src/components/Form';

const rules: ValidateRules = {
  a: {
    type: 'number',
  },
};

export const FormPage = () => {
  const state = reactive({
    align: 'left' as 'top' | 'left',
    labelWidth: '60px',
    items: [
      {
        field: 'a',
        label: '111',
        required: true,
        Input: () => <TextBox></TextBox>,
      },
      {
        field: 'b',
        label: '222',
        required: true,
        labelWidth: '100px',
        Input: () => {
          let combobox;

          return (
            <ComboBox
              api={(api) => (combobox = api)}
              value={state.b}
              popup={() => (
                <div
                  onclick={(event) => {
                    state.b = +event.target.textContent;
                    combobox.closePopup();
                  }}
                >
                  <div>1</div>
                  <div>2</div>
                </div>
              )}
            ></ComboBox>
          );
        },
      },
    ],
    a: 1,
    b: 2,

    form: {
      username: '',
    },
  });

  let form: FormApi;

  let form2: FormApi;

  return (
    <>
      <Form data={state} rules={{}} align={state.align} labelWidth={state.labelWidth} api={(api) => (form = api)}>
        <For each={state.items}>
          {(item) => (
            <FormItem field={item.field} label={item.label} required={item.required}>
              <div>
                <item.Input></item.Input>
              </div>
            </FormItem>
          )}
        </For>
        <div>{`a: ${state.a}  b: ${state.b}`}</div>
        <button
          type="button"
          onclick={() =>
            state.items.push({
              field: '?',
              label: '???',
              required: false,
              labelWidth: '100px',
              Input: () => <TextBox></TextBox>,
            })
          }
        >
          append
        </button>
        <button type="button" onclick={() => (state.align = state.align === 'left' ? 'top' : 'left')}>
          align
        </button>
        <button type="button" onclick={() => (state.labelWidth = parseInt(state.labelWidth) + 10 + 'px')}>
          labelWidth
        </button>
        <button type="button" onclick={() => form.validate()}>
          validate
        </button>
        <button type="button" onclick={() => form.clearErrors()}>
          clearErrors
        </button>
      </Form>

      <Form data={state.form} rules={{}} api={(api) => (form2 = api)}>
        <FormItem label="username" required field="username">
          <input value={state.form.username} onchange={(e) => (state.form.username = e.target.value)} />
        </FormItem>
      </Form>

      <button
        onclick={async () => {
          const valid = await form2.validate();
          console.log(valid);
        }}
      >
        click
      </button>
    </>
  );
};
