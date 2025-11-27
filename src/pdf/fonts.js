import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// pdfmake o‘zining VFS bazasini yuklaydi
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Bizning matematik fontni qo‘shish
import NotoSansMath from "/srs/assest/fonts/NotoSansMath-Regular.ttf";

pdfMake.fonts = {
  // Asosiy fontlaringiz bo‘lsa ham qoldiring
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },

  // Matematik superscript/subscript uchun
  NotoSansMath: {
    normal: "NotoSansMath-Regular.ttf",
    bold: "NotoSansMath-Regular.ttf",
    italics: "NotoSansMath-Regular.ttf",
    bolditalics: "NotoSansMath-Regular.ttf",
  },
};

// font faylini VFS ga qo‘shamiz
pdfMake.vfs["NotoSansMath-Regular.ttf"] = NotoSansMath;
