/*! UIkit 2.24.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) { // AMD
        define("uikit-lightbox", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    var modal, cache = {};

    UI.component('lightbox', {

        defaults: {
            "group"      : false,
            "duration"   : 400,
            "keyboard"   : true
        },

        index : 0,
        items : false,

        boot: function() {

            UI.$html.on('click', '[data-uk-lightbox]', function(e){

                e.preventDefault();

                var link = UI.$(this);

                if (!link.data("lightbox")) {

                    UI.lightbox(link, UI.Utils.options(link.attr("data-uk-lightbox")));
                }

                link.data("lightbox").show(link);
            });

            // keyboard navigation
            UI.$doc.on('keyup', function(e) {

                if (modal && modal.is(':visible') && modal.lightbox.options.keyboard) {

                    e.preventDefault();

                    switch(e.keyCode) {
                        case 37:
                            modal.lightbox.previous();
                            break;
                        case 39:
                            modal.lightbox.next();
                            break;
                    }
                }
            });
        },

        init: function() {

            var siblings = [];

            this.index    = 0;
            this.siblings = [];

            if (this.element && this.element.length) {

                var domSiblings  = this.options.group ? UI.$([
                    '[data-uk-lightbox*="'+this.options.group+'"]',
                    "[data-uk-lightbox*='"+this.options.group+"']"
                ].join(',')) : this.element;

                domSiblings.each(function() {

                    var ele = UI.$(this);

                    siblings.push({
                        'source': ele.attr('href'),
                        'title' : ele.attr('data-title') || ele.attr('title'),
                        'type'  : ele.attr("data-lightbox-type") || 'auto',
                        'link'  : ele
                    });
                });

                this.index    = domSiblings.index(this.element);
                this.siblings = siblings;

            } else if (this.options.group && this.options.group.length) {
                this.siblings = this.options.group;
            }

            this.trigger('lightbox-init', [this]);
        },

        show: function(index) {

            this.modal = getModal(this);

            // stop previous animation
            this.modal.dialog.stop();
            this.modal.content.stop();

            var $this = this, promise = UI.$.Deferred(), data, item;

            index = index || 0;

            // index is a jQuery object or DOM element
            if (typeof(index) == 'object') {

                this.siblings.forEach(function(s, idx){

                    if (index[0] === s.link[0]) {
                        index = idx;
                    }
                });
            }

            // fix index if needed
            if ( index < 0 ) {
                index = this.siblings.length - index;
            } else if (!this.siblings[index]) {
                index = 0;
            }

            item   = this.siblings[index];

            data = {
                "lightbox" : $this,
                "source"   : item.source,
                "type"     : item.type,
                "index"    : index,
                "promise"  : promise,
                "title"    : item.title,
                "item"     : item,
                "meta"     : {
                    "content" : '',
                    "width"   : null,
                    "height"  : null
                }
            };

            this.index = index;

            this.modal.content.empty();

            if (!this.modal.is(':visible')) {
                this.modal.content.css({width:'', height:''}).empty();
                this.modal.modal.show();
            }

            this.modal.loader.removeClass('uk-hidden');

            promise.promise().done(function() {

                $this.data = data;
                $this.fitSize(data);

            }).fail(function(){

                data.meta.content = '<div class="uk-position-cover uk-flex uk-flex-middle uk-flex-center"><strong>Loading resource failed!</strong></div>';
                data.meta.width   = 400;
                data.meta.height  = 300;

                $this.data = data;
                $this.fitSize(data);
            });

            $this.trigger('showitem.uk.lightbox', [data]);
        },

        fitSize: function() {

            var $this    = this,
                data     = this.data,
                pad      = this.modal.dialog.outerWidth() - this.modal.dialog.width(),
                dpadTop  = parseInt(this.modal.dialog.css('margin-top'), 10),
                dpadBot  = parseInt(this.modal.dialog.css('margin-bottom'), 10),
                dpad     = dpadTop + dpadBot,
                content  = data.meta.content,
                duration = $this.options.duration;

            if (this.siblings.length > 1) {

                content = [
                    content,
                    '<a href="#" class="uk-slidenav uk-slidenav-contrast uk-slidenav-previous uk-hidden-touch" data-lightbox-previous></a>',
                    '<a href="#" class="uk-slidenav uk-slidenav-contrast uk-slidenav-next uk-hidden-touch" data-lightbox-next></a>'
                ].join('');
            }

            // calculate width
            var tmp = UI.$('<div>&nbsp;</div>').css({
                'opacity'   : 0,
                'position'  : 'absolute',
                'top'       : 0,
                'left'      : 0,
                'width'     : '100%',
                'max-width' : $this.modal.dialog.css('max-width'),
                'padding'   : $this.modal.dialog.css('padding'),
                'margin'    : $this.modal.dialog.css('margin')
            }), maxwidth, maxheight, w = data.meta.width, h = data.meta.height;

            tmp.appendTo('body').width();

            maxwidth  = tmp.width();
            maxheight = window.innerHeight - dpad;

            tmp.remove();

            this.modal.dialog.find('.uk-modal-caption').remove();

            if (data.title) {
                this.modal.dialog.append('<div class="uk-modal-caption">'+data.title+'</div>');
                maxheight -= this.modal.dialog.find('.uk-modal-caption').outerHeight();
            }

            if (maxwidth < data.meta.width) {

                h = Math.floor( h * (maxwidth / w) );
                w = maxwidth;
            }

            if (maxheight < h) {

                h = Math.floor(maxheight);
                w = Math.ceil(data.meta.width * (maxheight/data.meta.height));
            }

            this.modal.content.css('opacity', 0).width(w).html(content);

            if (data.type == 'iframe') {
                this.modal.content.find('iframe:first').height(h);
            }

            var dh   = h + pad,
                t    = Math.floor(window.innerHeight/2 - dh/2) - dpad;

            if (t < 0) { t = 0; }

            this.modal.closer.addClass('uk-hidden');

            if ($this.modal.data('mwidth') == w &&  $this.modal.data('mheight') == h) {
                duration = 0;
            }

            this.modal.dialog.animate({width: w + pad, height: h + pad, top: t }, duration, 'swing', function() {
                $this.modal.loader.addClass('uk-hidden');
                $this.modal.content.css({width:''}).animate({'opacity': 1}, function() {
                    $this.modal.closer.removeClass('uk-hidden');
                });

                $this.modal.data({'mwidth': w, 'mheight': h});
            });
        },

        next: function() {
            this.show(this.siblings[(this.index+1)] ? (this.index+1) : 0);
        },

        previous: function() {
            this.show(this.siblings[(this.index-1)] ? (this.index-1) : this.siblings.length-1);
        }
    });


    // Plugins

    UI.plugin('lightbox', 'image', {

        init: function(lightbox) {

            lightbox.on("showitem.uk.lightbox", function(e, data){

                if (data.type == 'image' || data.source && data.source.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {

                    var resolve = function(source, width, height) {

                        data.meta = {
                            "content" : '<img class="uk-responsive-width" width="'+width+'" height="'+height+'" src ="'+source+'">',
                            "width"   : width,
                            "height"  : height
                        };

                        data.type = 'image';

                        data.promise.resolve();
                    };

                    if (!cache[data.source]) {

                        var img = new Image();

                        img.onerror = function(){
                            data.promise.reject('Loading image failed');
                        };

                        img.onload = function(){
                            cache[data.source] = {width: img.width, height: img.height};
                            resolve(data.source, cache[data.source].width, cache[data.source].height);
                        };

                        img.src = data.source;

                    } else {
                        resolve(data.source, cache[data.source].width, cache[data.source].height);
                    }
                }
            });
        }
    });

    UI.plugin("lightbox", "youtube", {

        init: function(lightbox) {

            var youtubeRegExp = /(\/\/.*?youtube\.[a-z]+)\/watch\?v=([^&]+)&?(.*)/,
                youtubeRegExpShort = /youtu\.be\/(.*)/;


            lightbox.on("showitem.uk.lightbox", function(e, data){

                var id, matches, resolve = function(id, width, height) {

                    data.meta = {
                        'content': '<iframe src="//www.youtube.com/embed/'+id+'" width="'+width+'" height="'+height+'" style="max-width:100%;"></iframe>',
                        'width': width,
                        'height': height
                    };

                    data.type = 'iframe';

                    data.promise.resolve();
                };

                if (matches = data.source.match(youtubeRegExp)) {
                    id = matches[2];
                }

                if (matches = data.source.match(youtubeRegExpShort)) {
                    id = matches[1];
                }

                if (id) {

                    if(!cache[id]) {

                        var img = new Image(), lowres = false;

                        img.onerror = function(){
                            cache[id] = {width:640, height:320};
                            resolve(id, cache[id].width, cache[id].height);
                        };

                        img.onload = function(){
                            //youtube default 404 thumb, fall back to lowres
                            if (img.width == 120 && img.height == 90) {
                                if (!lowres) {
                                    lowres = true;
                                    img.src = '//img.youtube.com/vi/' + id + '/0.jpg';
                                } else {
                                    cache[id] = {width: 640, height: 320};
                                    resolve(id, cache[id].width, cache[id].height);
                                }
                            } else {
                                cache[id] = {width: img.width, height: img.height};
                                resolve(id, img.width, img.height);
                            }
                        };

                        img.src = '//img.youtube.com/vi/'+id+'/maxresdefault.jpg';

                    } else {
                        resolve(id, cache[id].width, cache[id].height);
                    }

                    e.stopImmediatePropagation();
                }
            });
        }
    });


    UI.plugin("lightbox", "vimeo", {

        init: function(lightbox) {

            var regex = /(\/\/.*?)vimeo\.[a-z]+\/([0-9]+).*?/, matches;


            lightbox.on("showitem.uk.lightbox", function(e, data){

                var id, resolve = function(id, width, height) {

                    data.meta = {
                        'content': '<iframe src="//player.vimeo.com/video/'+id+'" width="'+width+'" height="'+height+'" style="width:100%;box-sizing:border-box;"></iframe>',
                        'width': width,
                        'height': height
                    };

                    data.type = 'iframe';

                    data.promise.resolve();
                };

                if (matches = data.source.match(regex)) {

                    id = matches[2];

                    if(!cache[id]) {

                        UI.$.ajax({
                            type     : 'GET',
                            url      : 'http://vimeo.com/api/oembed.json?url=' + encodeURI(data.source),
                            jsonp    : 'callback',
                            dataType : 'jsonp',
                            success  : function(data) {
                                cache[id] = {width:data.width, height:data.height};
                                resolve(id, cache[id].width, cache[id].height);
                            }
                        });

                    } else {
                        resolve(id, cache[id].width, cache[id].height);
                    }

                    e.stopImmediatePropagation();
                }
            });
        }
    });

    UI.plugin("lightbox", "video", {

        init: function(lightbox) {

            lightbox.on("showitem.uk.lightbox", function(e, data){


                var resolve = function(source, width, height) {

                    data.meta = {
                        'content': '<video class="uk-responsive-width" src="'+source+'" width="'+width+'" height="'+height+'" controls></video>',
                        'width': width,
                        'height': height
                    };

                    data.type = 'video';

                    data.promise.resolve();
                };

                if (data.type == 'video' || data.source.match(/\.(mp4|webm|ogv)$/i)) {

                    if (!cache[data.source]) {

                        var vid = UI.$('<video style="position:fixed;visibility:hidden;top:-10000px;"></video>').attr('src', data.source).appendTo('body');

                        var idle = setInterval(function() {

                            if (vid[0].videoWidth) {
                                clearInterval(idle);
                                cache[data.source] = {width: vid[0].videoWidth, height: vid[0].videoHeight};
                                resolve(data.source, cache[data.source].width, cache[data.source].height);
                                vid.remove();
                            }

                        }, 20);

                    } else {
                        resolve(data.source, cache[data.source].width, cache[data.source].height);
                    }
                }
            });
        }
    });


    function getModal(lightbox) {

        if (modal) {
            modal.lightbox = lightbox;
            return modal;
        }

        // init lightbox container
        modal = UI.$([
            '<div class="uk-modal">',
                '<div class="uk-modal-dialog uk-modal-dialog-lightbox uk-slidenav-position" style="margin-left:auto;margin-right:auto;width:200px;height:200px;top:'+Math.abs(window.innerHeight/2 - 200)+'px;">',
                    '<a href="#" class="uk-modal-close uk-close uk-close-alt"></a>',
                    '<div class="uk-lightbox-content"></div>',
                    '<div class="uk-modal-spinner uk-hidden"></div>',
                '</div>',
            '</div>'
        ].join('')).appendTo('body');

        modal.dialog  = modal.find('.uk-modal-dialog:first');
        modal.content = modal.find('.uk-lightbox-content:first');
        modal.loader  = modal.find('.uk-modal-spinner:first');
        modal.closer  = modal.find('.uk-close.uk-close-alt');
        modal.modal   = UI.modal(modal, {modal:false});

        // next / previous
        modal.on("swipeRight swipeLeft", function(e) {
            modal.lightbox[e.type=='swipeLeft' ? 'next':'previous']();
        }).on("click", "[data-lightbox-previous], [data-lightbox-next]", function(e){
            e.preventDefault();
            modal.lightbox[UI.$(this).is('[data-lightbox-next]') ? 'next':'previous']();
        });

        // destroy content on modal hide
        modal.on("hide.uk.modal", function(e) {
            modal.content.html('');
        });

        UI.$win.on('load resize orientationchange', UI.Utils.debounce(function(e){
            if (modal.is(':visible') && !UI.Utils.isFullscreen()) modal.lightbox.fitSize();
        }.bind(this), 100));

        modal.lightbox = lightbox;

        return modal;
    }

    UI.lightbox.create = function(items, options) {

        if (!items) return;

        var group = [], o;

        items.forEach(function(item) {

            group.push(UI.$.extend({
                'source' : '',
                'title'  : '',
                'type'   : 'auto',
                'link'   : false
            }, (typeof(item) == 'string' ? {'source': item} : item)));
        });

        o = UI.lightbox(UI.$.extend({}, options, {'group':group}));

        return o;
    };

    return UI.lightbox;
});

/*! UIkit 2.24.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(UI) {

    "use strict";

    var active = false, activeCount = 0, $html = UI.$html, body;

    UI.component('modal', {

        defaults: {
            keyboard: true,
            bgclose: true,
            minScrollHeight: 150,
            center: false,
            modal: true
        },

        scrollable: false,
        transition: false,
        hasTransitioned: true,

        init: function() {

            if (!body) body = UI.$('body');

            if (!this.element.length) return;

            var $this = this;

            this.paddingdir = "padding-" + (UI.langdirection == 'left' ? "right":"left");
            this.dialog     = this.find(".uk-modal-dialog");

            this.active     = false;

            // Update ARIA
            this.element.attr('aria-hidden', this.element.hasClass("uk-open"));

            this.on("click", ".uk-modal-close", function(e) {
                e.preventDefault();
                $this.hide();
            }).on("click", function(e) {

                var target = UI.$(e.target);

                if (target[0] == $this.element[0] && $this.options.bgclose) {
                    $this.hide();
                }
            });
        },

        toggle: function() {
            return this[this.isActive() ? "hide" : "show"]();
        },

        show: function() {

            if (!this.element.length) return;

            var $this = this;

            if (this.isActive()) return;

            if (this.options.modal && active) {
                active.hide(true);
            }

            this.element.removeClass("uk-open").show();
            this.resize();

            if (this.options.modal) {
                active = this;
            }

            this.active = true;

            activeCount++;

            if (UI.support.transition) {
                this.hasTransitioned = false;
                this.element.one(UI.support.transition.end, function(){
                    $this.hasTransitioned = true;
                }).addClass("uk-open");
            } else {
                this.element.addClass("uk-open");
            }

            $html.addClass("uk-modal-page").height(); // force browser engine redraw

            // Update ARIA
            this.element.attr('aria-hidden', 'false');

            this.element.trigger("show.uk.modal");

            UI.Utils.checkDisplay(this.dialog, true);

            return this;
        },

        hide: function(force) {

            if (!force && UI.support.transition && this.hasTransitioned) {

                var $this = this;

                this.one(UI.support.transition.end, function() {
                    $this._hide();
                }).removeClass("uk-open");

            } else {

                this._hide();
            }

            return this;
        },

        resize: function() {

            var bodywidth  = body.width();

            this.scrollbarwidth = window.innerWidth - bodywidth;

            body.css(this.paddingdir, this.scrollbarwidth);

            this.element.css('overflow-y', this.scrollbarwidth ? 'scroll' : 'auto');

            if (!this.updateScrollable() && this.options.center) {

                var dh  = this.dialog.outerHeight(),
                pad = parseInt(this.dialog.css('margin-top'), 10) + parseInt(this.dialog.css('margin-bottom'), 10);

                if ((dh + pad) < window.innerHeight) {
                    this.dialog.css({'top': (window.innerHeight/2 - dh/2) - pad });
                } else {
                    this.dialog.css({'top': ''});
                }
            }
        },

        updateScrollable: function() {

            // has scrollable?
            var scrollable = this.dialog.find('.uk-overflow-container:visible:first');

            if (scrollable.length) {

                scrollable.css('height', 0);

                var offset = Math.abs(parseInt(this.dialog.css('margin-top'), 10)),
                dh     = this.dialog.outerHeight(),
                wh     = window.innerHeight,
                h      = wh - 2*(offset < 20 ? 20:offset) - dh;

                scrollable.css({
                    'max-height': (h < this.options.minScrollHeight ? '':h),
                    'height':''
                });

                return true;
            }

            return false;
        },

        _hide: function() {

            this.active = false;
            if (activeCount > 0) activeCount--;
            else activeCount = 0;

            this.element.hide().removeClass('uk-open');

            // Update ARIA
            this.element.attr('aria-hidden', 'true');

            if (!activeCount) {
                $html.removeClass('uk-modal-page');
                body.css(this.paddingdir, "");
            }

            if(active===this) active = false;

            this.trigger('hide.uk.modal');
        },

        isActive: function() {
            return this.active;
        }

    });

    UI.component('modalTrigger', {

        boot: function() {

            // init code
            UI.$html.on("click.modal.uikit", "[data-uk-modal]", function(e) {

                var ele = UI.$(this);

                if (ele.is("a")) {
                    e.preventDefault();
                }

                if (!ele.data("modalTrigger")) {
                    var modal = UI.modalTrigger(ele, UI.Utils.options(ele.attr("data-uk-modal")));
                    modal.show();
                }

            });

            // close modal on esc button
            UI.$html.on('keydown.modal.uikit', function (e) {

                if (active && e.keyCode === 27 && active.options.keyboard) { // ESC
                    e.preventDefault();
                    active.hide();
                }
            });

            UI.$win.on("resize orientationchange", UI.Utils.debounce(function(){
                if (active) active.resize();
            }, 150));
        },

        init: function() {

            var $this = this;

            this.options = UI.$.extend({
                "target": $this.element.is("a") ? $this.element.attr("href") : false
            }, this.options);

            this.modal = UI.modal(this.options.target, this.options);

            this.on("click", function(e) {
                e.preventDefault();
                $this.show();
            });

            //methods
            this.proxy(this.modal, "show hide isActive");
        }
    });

    UI.modal.dialog = function(content, options) {

        var modal = UI.modal(UI.$(UI.modal.dialog.template).appendTo("body"), options);

        modal.on("hide.uk.modal", function(){
            if (modal.persist) {
                modal.persist.appendTo(modal.persist.data("modalPersistParent"));
                modal.persist = false;
            }
            modal.element.remove();
        });

        setContent(content, modal);

        return modal;
    };

    UI.modal.dialog.template = '<div class="uk-modal"><div class="uk-modal-dialog" style="min-height:0;"></div></div>';

    UI.modal.alert = function(content, options) {

        options = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, options);

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content)+'</div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button uk-button-primary uk-modal-close">'+options.labels.Ok+'</button></div>'
        ]).join(""), options);

        modal.on('show.uk.modal', function(){
            setTimeout(function(){
                modal.element.find('button:first').focus();
            }, 50);
        });

        return modal.show();
    };

    UI.modal.confirm = function(content, onconfirm, oncancel) {

        var options = arguments.length > 1 && arguments[arguments.length-1] ? arguments[arguments.length-1] : {};

        onconfirm = UI.$.isFunction(onconfirm) ? onconfirm : function(){};
        oncancel  = UI.$.isFunction(oncancel) ? oncancel : function(){};
        options   = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, UI.$.isFunction(options) ? {}:options);

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content)+'</div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button js-modal-confirm-cancel">'+options.labels.Cancel+'</button> <button class="uk-button uk-button-primary js-modal-confirm">'+options.labels.Ok+'</button></div>'
        ]).join(""), options);

        modal.element.find(".js-modal-confirm, .js-modal-confirm-cancel").on("click", function(){
            UI.$(this).is('.js-modal-confirm') ? onconfirm() : oncancel();
            modal.hide();
        });

        modal.on('show.uk.modal', function(){
            setTimeout(function(){
                modal.element.find('.js-modal-confirm').focus();
            }, 50);
        });

        return modal.show();
    };

    UI.modal.prompt = function(text, value, onsubmit, options) {

        onsubmit = UI.$.isFunction(onsubmit) ? onsubmit : function(value){};
        options  = UI.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:UI.modal.labels}, options);

        var modal = UI.modal.dialog(([
            text ? '<div class="uk-modal-content uk-form">'+String(text)+'</div>':'',
            '<div class="uk-margin-small-top uk-modal-content uk-form"><p><input type="text" class="uk-width-1-1"></p></div>',
            '<div class="uk-modal-footer uk-text-right"><button class="uk-button uk-modal-close">'+options.labels.Cancel+'</button> <button class="uk-button uk-button-primary js-modal-ok">'+options.labels.Ok+'</button></div>'
        ]).join(""), options),

        input = modal.element.find("input[type='text']").val(value || '').on('keyup', function(e){
            if (e.keyCode == 13) {
                modal.element.find(".js-modal-ok").trigger('click');
            }
        });

        modal.element.find(".js-modal-ok").on("click", function(){
            if (onsubmit(input.val())!==false){
                modal.hide();
            }
        });

        modal.on('show.uk.modal', function(){
            setTimeout(function(){
                input.focus();
            }, 50);
        });

        return modal.show();
    };

    UI.modal.blockUI = function(content, options) {

        var modal = UI.modal.dialog(([
            '<div class="uk-margin uk-modal-content">'+String(content || '<div class="uk-text-center">...</div>')+'</div>'
        ]).join(""), UI.$.extend({bgclose:false, keyboard:false, modal:false}, options));

        modal.content = modal.element.find('.uk-modal-content:first');

        return modal.show();
    };


    UI.modal.labels = {
        'Ok': 'Ok',
        'Cancel': 'Cancel'
    };


    // helper functions
    function setContent(content, modal){

        if(!modal) return;

        if (typeof content === 'object') {

            // convert DOM object to a jQuery object
            content = content instanceof jQuery ? content : UI.$(content);

            if(content.parent().length) {
                modal.persist = content;
                modal.persist.data("modalPersistParent", content.parent());
            }
        }else if (typeof content === 'string' || typeof content === 'number') {
                // just insert the data as innerHTML
                content = UI.$('<div></div>').html(content);
        }else {
                // unsupported data type!
                content = UI.$('<div></div>').html('UIkit.modal Error: Unsupported data type: ' + typeof content);
        }

        content.appendTo(modal.element.find('.uk-modal-dialog'));

        return modal;
    }

})(UIkit);
