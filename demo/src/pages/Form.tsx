import { reactive } from '../../../src/reactive';
import { For } from '../../../src/components/For';
import { TextBox } from '../../../src/components/TextBox';
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
      },
      {
        field: 'b',
        label: '222',
        required: true,
        labelWidth: '100px',
      },
    ],
  });

  let form: FormApi;

  return (
    <Form data={{}} rules={{}} align={state.align} labelWidth={state.labelWidth} api={(api) => (form = api)}>
      <For each={state.items}>
        {(item) => (
          <FormItem field={item.field} label={item.label} required={item.required}>
            <TextBox></TextBox>
          </FormItem>
        )}
      </For>
      <button
        type="button"
        onclick={() =>
          state.items.push({
            field: '?',
            label: '???',
            required: false,
            labelWidth: '100px',
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
    </Form>
  );
};
