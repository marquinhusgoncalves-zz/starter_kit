(function ($) {
    var $mobileNavToggleBtn,
        $blankATags = $('a[href^="#"]'),
        $body = $('html, body'),
        settings = {
            duration: 300
        };

    function onBtnClick (e) {
        var $this = $(this),
            $selectors = $('.mobile-nav');

        $this.toggleClass('is-open');
        $selectors.toggleClass('is-open');
    }

    function onBlankAClick (event) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $(href);

        if ($target.length > 0) {
            event.preventDefault();
            $body.animate({
                scrollTop: $target.offset().top
            }, settings.duration);
        }
    }

    $(document).ready(function () {
        $mobileNavToggleBtn = $('.mobile-nav-toggle');
        $mobileNavToggleBtn.on('click', onBtnClick);
        $blankATags.on('click', onBlankAClick);
    });

})(jQuery);

(function ($) {
    var $mobileNavToggleBtn,
        $blankATags = $('a[href^="#"]'),
        $body = $('html, body'),
        settings = {
            duration: 300
        };

    function onBtnClick (e) {
        var $this = $(this),
            $selectors = $('.mobile-nav');

        $this.toggleClass('is-open');
        $selectors.toggleClass('is-open');
    }

    function onBlankAClick (event) {
        var $this = $(this),
            href = $this.attr('href'),
            $target = $(href);

        if ($target.length > 0) {
            event.preventDefault();
            $body.animate({
                scrollTop: $target.offset().top
            }, settings.duration);
        }
    }

    $(document).ready(function () {
        $mobileNavToggleBtn = $('.mobile-nav-toggle');
        $mobileNavToggleBtn.on('click', onBtnClick);
        $blankATags.on('click', onBlankAClick);
    });

})(jQuery);
