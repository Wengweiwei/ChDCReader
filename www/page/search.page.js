"use strict"
define(["jquery", "main", "page", "util", 'book'], function($, app, page, util, book){

    // 加载结果列表
    function loadBooks(id, books, bookSourceId){
        var bs = $(id);
        var b = $(".template .book");
        bs.empty();
        for(var i =0; i < books.length; i++){
            var book = books[i];
            var nb = b.clone();
            if(book.cover)
                nb.find(".book-cover").attr("src", book.cover);
            nb.find(".book-name").text(book.name);
            nb.find(".book-lastestchapter").text("最新章节：" + (book.lastestChapter? book.lastestChapter : "无"));
            nb.find(".book-author").text(book.author);
            nb.find(".book-catagory").text(book.catagory);
            nb.find(".book-complete").text(book.complete);
            nb.find(".book-introduce").text(book.introduce);
            var bookDetailEvent = function(book){
                return function(){
                    var params = {
                        bookSourceId: bookSourceId,
                        book: book
                    };
                    page.showPage("bookdetail", params);
                };
            }(book);
            var bookAddBookShelfEvent = function(book){
                return function(){
                    app.bookShelf.addBook(book, function(){
                        util.showMessage("添加成功！");
                    });
                };
            }(book);
            // nb.click(bookDetailEvent);
            if(app.bookShelf.hasBook(book)){
                nb.find(".btnAddToBookshelf").attr('disabled', 'disabled');
            }
            else{
                nb.find(".btnAddToBookshelf").click(bookAddBookShelfEvent);
            }
            nb.find(".btnDetail").click(bookDetailEvent);
            bs.append(nb);
        };
    };

    return {
        onload: function(params, baseurl){
            // 添加选项
            var bookSource = $(".bookSource");
            var keys = app.bookSourceManager.getSourcesKeysByMainSourceWeight().reverse();
            for(var i = 0; i < keys.length; i++)
            {
                var bskey = keys[i];
                var bs = app.bookSourceManager.sources[bskey];
                var newOption = '<option value ="'+ bskey + '">' + bs.name + '</option>';
                bookSource.append(newOption);
            }
            $("#btnClose").click(function(){page.closePage();});
            $(".btnSearch").click(function(){
                app.showLoading();
                var keyword = $(".keyword").val();
                var bookSourceId = $(".bookSource").val();
                if(keyword && bookSourceId){
                    book.Book.searchBook(app.bookSourceManager, bookSourceId, keyword,
                            function(books){
                                loadBooks(".result", books, bookSourceId);
                                app.hideLoading();
                            });
                }
            });
        },
        onresume: function(){

        },
        onpause: function(){

        },
        onclose: function(params){

        }
    };
});
