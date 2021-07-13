const {series, dest} = require('gulp');
const del = require('del');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

function clean() {
    return del('dist/**', {force: true});
}

function tsc() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(dest("dist"));
}

exports.default = series(clean, tsc);
