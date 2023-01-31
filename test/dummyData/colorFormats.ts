// HEX

const hex = "#{{hex}}";
const hexa = "#{{hex}}{{aH}}";
const hexLarge = "#{{HEX}}";
const hexaLarge = "#{{HEX}}{{AH}}";

// RGB
const rgb = "rgb({{r}},{{g}},{{b}})";
const rgbAlt = "rgba({{r}},{{g}},{{b}})";
const rgba = "rgb({{r}},{{g}},{{b}},{{a}})";
const rgbaAlt = "rgb({{r}},{{g}},{{b}})";
const rgbSpaced = "rgb( {{r}},{{g}} , {{b}} )";
const rgbaSpaced = "rgb({{r}} , {{g}},{{b}} ,{{a}} )";
const rgbMultiline = `
rgb(
    {{r}},
    {{g}},
    {{b}}
)
`;
const rgbaMultiline = `
rgb(
    {{r}},
    {{g}},
    {{b}},
    {{a}}
)
`;

// HSL

const hsl = "hsl({{h}},{{s}},{{l}})";
const hslAlt = "hsl({{h}},{{s}},{{l}},{{a}})";
const hsla = "hsl({{h}},{{s}},{{l}},{{a}})";
const hslaAlt = "hsl({{h}},{{s}},{{l}})";
const hslSpaced = "hsl( {{h}},{{s}} , {{l}} )";
const hslaSpaced = "hsla({{h}} , {{s}},{{l}} ,{{a}} )";
const hslMultiline = `
hsl(
    {{h}},
    {{s}},
    {{l}}
)
`;
const hslaMultiline = `
hsl(
    {{h}},
    {{s}},
    {{l}},
    {{a}}
)
`;

// CMYK

const cmyk = "cmyk({{c}},{{m}},{{y}},{{k}})";
const cmyka = "cmyk({{c}},{{m}},{{y}},{{k}},{{a}})";
const cmykSpaced = "cmyk( {{c}},{{m}} , {{y}}, {{k}} )";
const cmykaSpaced = "cmyk({{c}} , {{m}},{{y}}, {{k}} ,{{a}} )";
const cmykMultiline = `
cmyk(
    {{c}},
    {{m}},
    {{y}},
    {{k}}
)
`;
const cmykaMultiline = `
cmyk(
    {{c}},
    {{m}},
    {{y}},
    {{k}},
    {{a}}
)
`;

/* Not supported yet */

const hsv = "hsv({{h}},{{s}},{{v}})";
const hsva = "hsv({{h}},{{s}},{{v}},{{a}})";
const hsvSpaced = "hsv( {{h}},{{s}} , {{v}} )";
const hsvaSpaced = "hsv({{h}} , {{s}},{{v}} ,{{a}} )";
const hsvMultiline = `
hsv(
    {{h}},
    {{s}},
    {{v}}
)
`;
const hsvaMultiline = `
hsv(
    {{h}},
    {{s}},
    {{v}},
    {{a}}
)
`;

const name = "{{name}}";
