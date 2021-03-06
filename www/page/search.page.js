"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(["jquery", "main", "Page", "utils", "uiutils"], function ($, app, Page, utils, uiutils) {
  var MyPage = function (_Page) {
    _inherits(MyPage, _Page);

    function MyPage() {
      _classCallCheck(this, MyPage);

      var _this = _possibleConstructorReturn(this, (MyPage.__proto__ || Object.getPrototypeOf(MyPage)).call(this));

      _this.scrollTop = 0;
      _this.container = $('.container');

      _this.loadedRemember = false;
      _this.remember = {
        bookType: "",
        ifFilterResult: false,
        searchLog: [],
        bookSourceId: ""
      };
      return _this;
    }

    _createClass(MyPage, [{
      key: "onLoad",
      value: function onLoad(_ref) {
        var _this2 = this;

        var params = _ref.params;

        this.loadView();
        if (!this.loadedRemember) utils.loadData("search.json").then(function (data) {
          if (data) _this2.remember = data;
          _this2.loadRemember();
        });else this.loadRemember();
      }
    }, {
      key: "onPause",
      value: function onPause() {
        this.scrollTop = this.container.scrollTop();
      }
    }, {
      key: "onResume",
      value: function onResume() {
        this.container.scrollTop(this.scrollTop);
      }
    }, {
      key: "saveRememberData",
      value: function saveRememberData() {
        utils.saveData("search.json", this.remember);
        this.loadedRemember = true;
      }
    }, {
      key: "loadBooks",
      value: function loadBooks(id, books) {
        var bs = $(id);
        var b = $(".template .book");
        bs.empty();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          var _loop = function _loop() {
            var book = _step.value;

            var nb = b.clone();
            if (book.cover) nb.find(".book-cover").attr("src", book.cover);

            nb.find(".book-type").text(app.bookSourceManager.getBookSourceTypeName(book.mainSourceId));

            nb.find(".book-name").text(book.name).click(function (e) {
              return window.open(book.getOfficialDetailLink(), '_system');
            });
            nb.find(".book-author").text(book.author);
            nb.find(".book-catagory").text(book.catagory);
            nb.find(".book-complete").text(book.complete ? "完结" : "连载中");
            nb.find(".book-introduce").text(book.introduce);

            if (app.bookShelf.hasBook(book)) {
              nb.find(".btnAddToBookshelf").attr('disabled', 'disabled');
            } else {
              nb.find(".btnAddToBookshelf").click(function (event) {
                app.bookShelf.addBook(book);

                $(event.currentTarget).attr("disabled", "disabled");
                app.bookShelf.save().then(function () {
                  uiutils.showMessage("添加成功！");
                  book.checkBookSources();

                  book.cacheChapter(0, app.settings.settings.cacheChapterCount);
                }).catch(function (error) {
                  $(event.currentTarget).removeAttr("disabled");
                });
              });
            }
            nb.find(".btnDetail").click(function (e) {
              return app.page.showPage("bookdetail", { book: book });
            });
            nb.find(".book-booksource").text(app.bookSourceManager.getBookSource(book.mainSourceId).name);
            bs.append(nb);
          };

          for (var _iterator = books[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: "search",
      value: function search() {
        var _this3 = this;

        $("#result").show();
        $("#searchLogPanel").hide();
        app.showLoading();
        var keyword = $("#keyword").val().trim();
        var bookSourceId = $("#bookSource").val();
        var bookType = $("#bookType").val();
        var ifFilterResult = $("#chkFilterResult")[0].checked;

        this.remember.bookType = bookType;
        this.remember.ifFilterResult = ifFilterResult;
        this.remember.bookSourceId = bookSourceId;
        if (!this.remember.searchLog.includes(keyword)) this.remember.searchLog.unshift(keyword);
        this.saveRememberData();

        $('#result').empty();
        if (!keyword) {
          uiutils.showError("请输入要搜索的关键字");
          return;
        }

        if (!bookSourceId) {
          app.bookSourceManager.searchBookInAllBookSource(keyword, { filterSameResult: ifFilterResult, bookType: bookType }).then(function (books) {
            app.hideLoading();
            _this3.loadBooks("#result", books);
          }).catch(function (error) {
            app.hideLoading();
            uiutils.showError(app.error.getMessage(error));
          });
          return;
        }

        app.bookSourceManager.searchBook(bookSourceId, keyword).then(function (books) {
          app.hideLoading();
          _this3.loadBooks("#result", books);
        }).catch(function (error) {
          app.hideLoading();
          uiutils.showError(app.error.getMessage(error));
        });
      }
    }, {
      key: "loadRemember",
      value: function loadRemember() {
        var _this4 = this;

        $("#bookSource").val(this.remember.bookSourceId);
        $("#bookType").val(this.remember.bookType);
        $("#chkFilterResult")[0].checked = this.remember.ifFilterResult;

        var tsl = $(".template .searchLogItem");
        $("#searchLog").empty();
        this.remember.searchLog.forEach(function (sl) {
          var nsl = tsl.clone();
          nsl.find('.title').text(sl);
          nsl.click(function (e) {
            $("#keyword").val(sl);
            _this4.search();
          });
          $("#searchLog").append(nsl);
        });
      }
    }, {
      key: "loadView",
      value: function loadView() {
        var _this5 = this;

        var bookSource = $("#bookSource");
        var keys = app.bookSourceManager.getSourcesKeysByMainSourceWeight();

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var bskey = _step2.value;

            var bsName = app.bookSourceManager.getBookSource(bskey).name;
            var newOption = "<option value =\"" + bskey + "\">" + bsName + "</option>";
            bookSource.append(newOption);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        $("#btnClose").click(function (e) {
          return _this5.close();
        });
        $("#btnSearch").click(function (e) {
          return _this5.search();
        });
        $("#keyword").on('keydown', function (event) {
          return !(event.keyCode == 13 && _this5.search());
        }).on('focus', function (event) {
          return event.currentTarget.select();
        }).on('input', function (event) {
          if (!$("#keyword").val()) {
            $("#result").hide();
            $("#searchLogPanel").show();
            _this5.loadRemember();
          }
        });
        $("#clearSearchLog").click(function (e) {
          _this5.remember.searchLog = [];
          _this5.saveRememberData();
          _this5.loadRemember();
        });
      }
    }]);

    return MyPage;
  }(Page);

  return MyPage;
});