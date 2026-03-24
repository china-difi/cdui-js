
const Form = ({ a, b, c }, context) => {
  return <div></div>
};


const FormPage1 = () => {
  const state = reactive({
    align: 'right',
    width: '100px',
  });

  createEffect(() => {

  });

  watch(() => state.align, align => {

  });

  return Form(
    {
      data: {},
      rules: {},
      align: () => state.align,
      labelWidth: () => state.width,
    },
    (context) => [
      FormItem(
        {
          field: 'a',
          label: '111',
        },
        (context) => [],
      ),
      FormItem(
        {
          field: 'b',
          label: () => [_tmpl$3(), _tmpl$4()],
        },
        (context) => [],
      ),
    ],
  );
};
