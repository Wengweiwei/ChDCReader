define(["jquery", "util"], function($, util) {
    "use strict"

    // book 全局的错误码定义
    /*
     * 2xx 章节错误
     * 3xx 设置源错误
     * 4xx 书籍错误
     */
    function getError(errorCode){
        var bookErrorCode = {
            201: "未发现该章节！",
            202: "没有更新的章节了！",
            203: "前面没有章节了！",
            204: "索引值超界！",
            205: "索引值应该是数字！",

            301: "设置主要内容来源失败！",
            401: "源配置不正确！",
            404: "未在当前的源中找到该书！"
        };
        return {
            id: errorCode,
            message: bookErrorCode[errorCode]
        }
    }

    // ****** Book ****
    function Book(){
    };

    // 属性
    // Book.prototype.id = "";  // 编号
    Book.prototype.name = "";  // 书名
    Book.prototype.author = "";  // 作者
    Book.prototype.catagory = "";  // 分类
    Book.prototype.cover = "";  // 封面
    Book.prototype.complete = undefined;  // 是否完结
    Book.prototype.introduce = "";  // 简介
    Book.prototype.sources = undefined;  // 内容来源
    Book.prototype.currentSource = undefined;  // 当前来源
    Book.prototype.lastestChapterSource = undefined;  // 用于查询最新章节的源

    Book.prototype.lastestChapter = undefined;  // 最新的章节

    // 修复属性用的工具函数
    Book.fixer = {
        fixChapterContent: function(html){
            // 从 HTML 文本中获取格式化的正文
            return util.html2text(html);
        },

        fixChapterTitle: function(text){
            // 从 HTML 文本中获取格式化的正文
            return text.trim();
        },

        fixName: function(text)
        {
            //书名
            text = text.trim();
            return text;
        },

        fixAuthor: function(text)
        {
            //作者
            text = text.trim();
            return text;
        },

        fixCatagory: function(text)
        {
            //分类
            text = text.trim();
            return text;
        },

        // fixCover: function(text)
        // {
        //     //封面
        //     text = text.trim();
        //     return text;
        // },

        fixComplete: function(text)
        {
            //是否完结
            text = text.trim();
            return text;
        },

        fixIntroduce: function(text)
        {
            //简介
            text = text.trim();
            return text;
        },

        // fixReadingChapter: function(text)
        // {
        //     //读到的章节
        //     text = text.trim();
        //     return text;
        // },

        fixLastestChapter: function(text)
        {
            //最新的章节
            text = text.trim();
            return text;
        }
    };

    // 方法

    // 获取当前书籍指定的目录源信息
    Book.prototype.getBookSource = function(success, fail, options){
        var self = this;
        options = $.extend({}, options);
        options.bookSourceId = options.bookSourceId || self.currentSource;

        var bs = self.sources[options.bookSourceId];
        if(bs){
            if(success)success(bs, self);
        }
        else{
            options.bookSourceManager.getBook(options.bookSourceId, self.name, self.author,
                function(book, bsid){
                    // 找到书籍了
                    if(!self.sources)
                        self.sources = {};
                    bs = book.sources[bsid];
                    self.sources[bsid] = bs;
                    if(success)success(bs, self);
                },
                fail);
        }
    };

    // 清空除了主源之外的其他源的目录
    Book.prototype.__clearBookSources = function(){
        var self = this;
        if(self.sources){
            for(var key in self.sources){
                var bs = self.sources[key];
                if(key != self.currentSource){
                    bs.catalog = null;
                }
            }
        }
    };

    // 设置主源
    Book.prototype.setCurrentSource = function(bookSourceId, success, fail, options){
        var self = this;
        options = $.extend({}, options);
        if(bookSourceId && bookSourceId in options.bookSourceManager.sources){
            self.currentSource = bookSourceId;
            self.__clearBookSources();
            if(success)success(self);
        }
        else{
            if(fail)fail(getError(301));
        }
    };

    // 使用详情页链接刷新书籍信息
    // 前提：book.sources 中有详情链接
    Book.prototype.refreshBookInfo = function(success, fail, options){
        var self = this;
        options = $.extend({}, options);
        options.bookSourceId = options.bookSourceId || self.currentSource;
        self.getBookSource(function(bs){
            var bsm = options.bookSourceManager.sources[options.bookSourceId];
            var detailLink = bs.detailLink;
            var detail = bsm.detail;
            var info = detail.info;

            util.getDOM(detailLink, {}, getBookDetailFromHtml, fail);

            function getBookDetailFromHtml(html){
                // 更新信息的时候不更新书名和作者，因为换源的时候需要用到
                // self.name = Book.fixer.fixName(html.find(info.name).text());  // 书名
                // self.author = Book.fixer.fixAuthor(html.find(info.author).text());  // 作者

                self.catagory = Book.fixer.fixCatagory(html.find(info.catagory).text());  // 分类
                self.cover = util.fixurl(html.find(info.cover).attr("data-src"), detailLink);  // 封面
                self.complete = Book.fixer.fixComplete(html.find(info.complete).text());  // 是否完结
                self.introduce = Book.fixer.fixIntroduce(html.find(info.introduce).text());  // 简介
                self.lastestChapter = Book.fixer.fixLastestChapter(html.find(info.lastestChapter).text());  // 最新的章节

                // self.sources = {}; // 内容来源
                // self.sources[options.bookSourceId].catalog = self.__getBookCatalogFromHTML(element, detailLink, options);  // 目录
                // self.readingChapter = undefined;  // 读到的章节
                if(success)success(self, options.bookSourceId);
            };
        },
        fail, options);
    };

    // 刷新目录
    Book.prototype.refreshCatalog = function(success, fail, options){
        var self = this;
        options = $.extend({}, options);
        // options.bookSourceId = options.bookSourceId || self.currentSource;
        self.getBookSource(function(bs){
            // var bsm = options.bookSourceManager.sources[options.bookSourceId];
            var detailLink = bs.detailLink;
            util.getDOM(detailLink, {}, s, fail);

            function s(html){
                var catalog = self.__getBookCatalogFromHTML(html, detailLink, options);
                bs.catalog = catalog;
                if(success)success(catalog);
            };
        },
        fail, options);
    };

    // 从 HTML 中获取书籍章节目录
    Book.prototype.__getBookCatalogFromHTML = function(html, htmlLink, options){
        var self = this;
        options = $.extend({}, options);
        options.bookSourceId = options.bookSourceId || self.currentSource;
        var catalog = [];
        var bsm = options.bookSourceManager.sources[options.bookSourceId];
        if(!bsm)return;
        var info = bsm.catalog.info;

        html.find(info.link).each(function(){
            var element = $(this);
            var chapter = new Chapter();
            chapter.link = util.fixurl(element.attr('href'), htmlLink);
            chapter.title = Book.fixer.fixChapterTitle(element.text());
            // chapter.bookSourceId = options.bookSourceId;
            var i = util.arrayIndex(catalog, function(e){
                return e && e.title == chapter.title;
            });
            if(i >= 0){
                catalog[i] = null;
            }
            catalog.push(chapter);
        });
        return catalog.filter(function(e){return e});
    };

    // 获取目录
    // options:
    // * forceRefresh 强制刷新
    Book.prototype.getCatalog = function(success, fail, options){
        var self = this;
        options = $.extend({}, options);
        options.bookSourceId = options.bookSourceId || self.currentSource;

        self.getBookSource(function(bs){
            var bsm = options.bookSourceManager.sources[options.bookSourceId];
            if(!options.forceRefresh && bs.catalog){
                if(success)success(bs.catalog);
            }
            else{
                self.refreshCatalog(success, fail, options);
            }
        },
        fail, options);
    }

    // *************************** 章节部分 ****************
    // options
    // * reversed 正向搜索
    Book.fuzzySearch = function(catalog, chapterTitle, options){
        // TODO: 模糊搜索
        // if options.reversed
        return util.arrayLastIndex(catalog, findChapter);

        function findChapter(chapter){
            return chapter.title == chapterTitle;
        }
    }

    // 在目录中对章节标题进行模糊搜索
    // reversed true 正向搜索
    Book.prototype.fuzzySearch = function(chapterTitle, success, fail, options){
        var self = this;
        options = $.extend({}, options);
        // 默认从主目录源中搜索
        self.getCatalog(function(catalog){
                var i = Book.fuzzySearch(catalog, chapterTitle, options);
                if(i >= 0){
                    var chapter = catalog[i];
                    if(success)success(chapter, i, catalog);
                }
                else{
                    if(fail)fail(getError(201));
                }
            },
            fail, options);
    };

    // 用章节标题获取章节内容
    // chapterIndex 是从主要目录源中获取的章节索引
    Book.prototype.getChapter = function(chapterIndex, success, fail, options){
        if($.type(chapterIndex) != "number"){
            if(fail)
                fail(getError(205));
            return;
        }

        var self = this;
        options = $.extend({}, options);
        options = options || {};

        self.getCatalog(function(catalog){
            if(chapterIndex >=0 && chapterIndex < catalog.length){
                // 存在于目录中
                var rc = catalog[chapterIndex];
                self.__getChapterContentFromBookSource(rc.link,                function(chapter){
                    if(success)success(chapter, chapterIndex);
                }, fail, options);
            }
            else if(chapterIndex >= catalog.length)
            {
                // 超界了
                // 没有下一章节或者目录没有更新
                // 更新一下主目录源，然后再搜索
                self.refreshCatalog(function(catalog){
                    if(chapterIndex >=0 && chapterIndex < catalog.length){
                        // 存在于目录中
                        var rc = catalog[chapterIndex];
                        self.__getChapterContentFromBookSource(rc.link,                function(chapter){
                            if(success)success(chapter, chapterIndex);
                        }, fail, options);
                    }
                    else{
                        if(fail)fail(getError(202));
                    }
                }, fail, options);
            }
            else{
                // index < 0
                if(fail)fail(getError(203));
            }
        }, fail, options);
        // TODO:
        // 如果缓存中有就从缓存中加载
        // 如果没有就刷新
    };

    // 从网络上获取章节内容
    Book.prototype.__getChapterContentFromBookSource = function(chapterLink, success, fail, options){
        var self = this;
        options = $.extend({}, options);

        // 默认从主要内容源中获取章节
        options.bookSourceId = options.bookSourceId || self.currentSource;
        var bsm = options.bookSourceManager.sources[options.bookSourceId];
        var info = bsm.chapter.info;
        util.getDOM(chapterLink, {}, getChapterFromHtml, fail);

        function getChapterFromHtml(html){
            var chapter = new Chapter();
            chapter.title = Book.fixer.fixChapterTitle(html.find(info.title).text());
            chapter.modifyTime = html.find(info.modifyTime).text().trim();
            chapter.content = Book.fixer.fixChapterContent(html.find(info.content).html());
            if(success)success(chapter);
        }
    };

    // 缓存制定数量的章节
    Book.prototype.cacheChapter = function(count, success, fail, options){
        var self = this;
        options = $.extend({}, options);
        self.getCatalog(function(catalog){
            var bsm = options.bookSourceManager.sources[bookSourceId];

        });
    };

    // *************************** 章节部分结束 ****************

    // 获取书籍最新章节
    Book.prototype.getLastestChapterTitle = function(keyword, success, fail, options){
    };

    // **** Chapter ****
    function Chapter(){

    }

    Chapter.prototype.link = undefined;    // 链接
    Chapter.prototype.title = undefined;    // 标题
    Chapter.prototype.content = undefined;  // 内容
    Chapter.prototype.modifyTime = undefined;  // 修改时间

    // **** BookSource *****
    function BookSourceManager(configFile){
        var self = this;
        $.getJSON(configFile, function(data){
            self.sources = data;
        });
    };
    BookSourceManager.prototype.sources = undefined;


    // 通过书名字和目录搜索唯一的书籍
    BookSourceManager.prototype.getBook = function(bsid, bookName, bookAuthor, success, fail){
        var self = this;
        if(bsid && bookName && bookAuthor && bsid in self.sources){
            // 通过当前书名和作者名搜索添加源
            self.searchBook(bsid, bookName,
                function(books, keyword, bsid){
                    var i = util.arrayIndex(books, function(e){
                        return e.name == bookName && e.author == bookAuthor;
                    });
                    if(i >= 0){
                        // 找到书籍了
                        var book = books[i];
                        success(book, bsid);
                    }
                    else{
                        if(fail)fail(getError(404));
                    }
                },
                fail);
        }
        else{
            if(fail)fail(getError(401));
        }
    }

    // 搜索书籍
    BookSourceManager.prototype.searchBook = function(bsid, keyword, success, fail){
        var self = this;
        var bs = self.sources[bsid];
        if(!bs)return;
        var search = bs.search;
        var searchLink = util.format(search.url, {keyword: keyword});
        util.getDOM(searchLink, {}, getBookFromHtml, fail);

        function getBookFromHtml(html){
            var info = search.info;
            var detail = info.detail;
            var books = [];
            var bookItems = html.find(info.book);
            bookItems.each(function(){
                    var element = $(this);
                    var book = new Book();
                    book.name = Book.fixer.fixName(element.find(detail.name).text());  // 书名
                    book.author = Book.fixer.fixAuthor(element.find(detail.author).text());  // 作者
                    book.catagory = Book.fixer.fixCatagory(element.find(detail.catagory).text());  // 分类
                    book.cover = util.fixurl(element.find(detail.cover).attr("data-src"), searchLink);  // 封面
                    book.complete = Book.fixer.fixComplete(element.find(detail.complete).text());  // 是否完结
                    book.introduce = Book.fixer.fixIntroduce(element.find(detail.introduce).text());  // 简介
                    book.lastestChapter = Book.fixer.fixLastestChapter(element.find(detail.lastestChapter).text());  // 最新的章节

                    book.sources = {}; // 内容来源
                    book.sources[bsid] = {
                        detailLink: util.fixurl(element.find(detail.link).attr("href"), searchLink),  // 详情页链接
                        catalog: null,  // 目录
                    };

                    book.currentSource = bsid;  // 主要来源
                    return books.push(book);
                });
            if(success)success(books, keyword, bsid);
        };
    };


    // **** BookShelf *****
    function BookShelf(){
        this.books = [];
        this.sort = [0,1,2,3,4]; // 在书架的显示顺序
        this.readingRecords = []; // 阅读进度
        this.bookmarks = []; // 书签
    };
    BookShelf.prototype.books = undefined;

    // 添加书籍到书架中
    BookShelf.prototype.load = function(){
        var self = this;
        var bookShelf = util.storage.getItem("bookShelf") || {};
        $.extend(self, bookShelf);

        util.arrayCast(self.books, Book);
        util.arrayCast(self.readingRecords, ReadingRecord);
    };

    // 添加书籍到书架中
    BookShelf.prototype.save = function(){
        util.storage.setItem("bookShelf", this || {});
    };

    // 添加书籍到书架中
    BookShelf.prototype.addBook = function(book, success, fail){
        this.books.push(book);
        this.readingRecords.push(new ReadingRecord());
        this.save();
        if(success)success();
    };

    // **** ReadingRecord *****
    function ReadingRecord(){
        this.chapterIndex = 0;
        this.page = 0;
    };

    ReadingRecord.prototype.bookName = undefined; // 书名
    ReadingRecord.prototype.bookAuthor = undefined; // 作者
    ReadingRecord.prototype.chapterIndex = undefined; // 章节索引
    ReadingRecord.prototype.chapterTitle = undefined; // 章节标题
    ReadingRecord.prototype.page = undefined; // 章内的页数

    // **** ReadingRecordManager *****
    // 可用于书架的阅读进度，阅读历史，书签
    function ReadingRecordManager(){
        this.records = [];
    };

    return {
        Book: Book,
        BookSourceManager: BookSourceManager,
        BookShelf: BookShelf
    };
});
