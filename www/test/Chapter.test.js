"use strict";

;(function (deps, factory) {
  "use strict";

  if (typeof define === "function" && define.amd) define(deps, factory);else if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = factory.apply(undefined, deps.map(function (e) {
    return require(e);
  }));else window["Chapter_test"] = factory.apply(undefined, deps.map(function (e) {
    return window[e];
  }));
})(["chai", "Chapter", "utils"], function (chai, Chapter, utils) {

  var assert = chai.assert;
  var equal = assert.equal;

  describe('Chapter', function () {

    before(function () {});

    after(function () {});

    beforeEach(function () {});

    afterEach(function () {});

    it('stripString', function () {
      equal(undefined, Chapter.stripString());
      equal('', Chapter.stripString(''));
      equal('第一章好的啊', Chapter.stripString('第一章 好的啊【啊啊】(test)'));
      equal('第一章好的啊1', Chapter.stripString('第一章 好的啊【1啊啊】(test)'));
      equal('第一章好的啊12', Chapter.stripString('第一章 好的啊【啊1啊】(2test)'));
      equal('第一章好的啊零2', Chapter.stripString('第一章 好的啊【啊零啊】(2test)'));
    });

    it('equal', function () {

      equal(true, !!Chapter.equalTitle({ title: "第58章节 好的【abc】" }, { title: "第58章节    好的【abc】" }));
      equal(true, !!Chapter.equalTitle({ title: "第58章节 好的【abc】" }, { title: "第五十八章节    好的【abc】" }));
      equal(true, !!Chapter.equalTitle({ title: "第58章节 好的【abc】" }, { title: "第五八章节    好的【abc】" }));
      equal(true, !!Chapter.equalTitle({ title: "第584章节 好的【abc】" }, { title: "第五百八十四章节    好的【abc】" }));
      equal(true, !!Chapter.equalTitle({ title: "第504章节 好的【abc】" }, { title: "第五百零四章节    好的【abc】" }));
      equal(false, !!Chapter.equalTitle({ title: "第504章节 好的【abc】" }, { title: "第五百零三章节    好的【abc】" }));
      equal(false, !!Chapter.equalTitle({ title: "第503章节 好的(1)" }, { title: "第五百零三章节    好的(2)【abc】" }));
      equal(false, !!Chapter.equalTitle({ title: "第503章节 好的(1)" }, { title: "第五百零三章节    好的(2)【abc】" }));
      equal(true, !!Chapter.equalTitle({ title: "第503章节 好的(2)" }, { title: "第503章节 好的【二】" }));
      equal(false, !!Chapter.equalTitle({ title: "第503章节 好的(3)" }, { title: "第503章节 好的【二】" }));
      equal(true, !!Chapter.equalTitle("1009", "一千零九"));
      equal(true, !!Chapter.equalTitle("109", "一百零九"));
      equal(true, !!Chapter.equalTitle("19", "十九"));
      equal(true, !!Chapter.equalTitle("29", "二十九"));
      equal(true, !!Chapter.equalTitle("9", "九"));

      equal(true, !!Chapter.equalTitle("89话 二个知道爱神的人类", "089 第二个知道爱神的人类"));
      equal(true, !!Chapter.equalTitle("080 我是爱神", "80话 我是爱神"));

      equal(true, !!Chapter.equalTitle("第102弹 有难同当", "第102话 有难同当"));
      equal(true, !!Chapter.equalTitle("第167话 约法三章", "总167·约法三章"));
      equal(true, !!Chapter.equalTitle("102弹 有难同当", "第102弹 有难同当"));
      equal(true, !!Chapter.equalTitle("102弹", "第102弹 有难同当", true));
      equal(true, !!Chapter.equalTitle("第504章节 好的【abc】", "第五百零三章节    好的【abc】", true));
      equal(true, !!Chapter.equalTitle("第050话", "50话", true));
    });

    it("findEqualChapter", function () {
      var catalog = ["第1章 好的", "第2章 好的啊", "第3章 好的啊啊", "第4章 好的啊啊啊", "第5章 好的啊啊啊啊", "第6章 啊好的啊啊啊啊", "第7章 啊好的啊啊啊啊", "第9章 啊好的啊啊啊啊"];

      var catalogB = ["第5章 好的啊啊啊啊", "第6章 啊好的啊啊啊啊", "第1章 好的", "第2章 好的啊", "第章好的啊啊", "第4章 好的啊啊啊", "第8章 啊好的啊啊啊啊", "9"];

      var matches = [utils.listMatch.bind(utils), utils.listMatchWithNeighbour.bind(utils)];

      equal(2, Chapter.findEqualChapter(catalog, catalogB, 0, matches));
      equal(3, Chapter.findEqualChapter(catalog, catalogB, 1, matches));
      equal(4, Chapter.findEqualChapter(catalog, catalogB, 2, matches));
      equal(5, Chapter.findEqualChapter(catalog, catalogB, 3, matches));
      equal(0, Chapter.findEqualChapter(catalog, catalogB, 4, matches));
      equal(1, Chapter.findEqualChapter(catalog, catalogB, 5, matches));
      equal(-1, Chapter.findEqualChapter(catalog, catalogB, 6, matches, false));
      equal(6, Chapter.findEqualChapter(catalog, catalogB, 6, matches, true));
      equal(7, Chapter.findEqualChapter(catalog, catalogB, 7, matches, true));
    });
  });
});