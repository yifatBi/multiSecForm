/**
 * Created by yifatbiezuner on 02/08/15.
 * This plugin for form that have multi section that added or removed by typing on specific field(termToAdd)
 * You can find usages in edit event
 * If No reorder is needed then all needed to define is termToAdd,divTemplateId
 * Optional : classDefNewSec,sectionDefType- if different from the default
 */


(function ($) {
    $.fn.multiSecForm = function (customOptions) {
        var base = this;
        var defaultOptions = {
            //what will trigger another section
            termToAdd: '[data-partcomp]',
            //Class name for new section
            classDefNewSec: 'next-div',
            //what to do after adding another section-get the new num
            callbackAnother: function (newId) {
            },
            //Special callback when delete
            callbackDelete: function (removeItem,deletedVal) {
            },
            //What the type of each and every section
            sectionDefType: 'li',
            currentname: '',
            //The id of empty template to add
            divTemplateId: '',
            //if it's order section this attr save the current num - exist in the termToAdd
            isOrder: true,
            /////////------------------Only if order is needed-----------------------/////////
            //how to define each section
            listDef: '.partnerli',
            //How to define each order
            reorderDef: '.reorderLI',
            //Reorder each li
            reorderLiDef: '.eventOrderClickable',
            reorderLiClass: '',
            //what will trigger the toggle of order
            toggleTrigger: '.orderCaret',
            attrForNum: 'data-partcomp',
            //define the number of section to show
            numberClass: '.edit-partnerNum',
            //what will trigger the remove
            removeTrigger: '.removeSec',
            //reorder class name-for the order list when adding new one
            reorderClass: ''
        };

        var options = $.extend({}, defaultOptions, customOptions);
        if (options.isOrder){
            if (!options.reorderClass) {
                options.reorderClass = options.reorderDef.slice(1)
            }
            if (!options.reorderLiClass) {
                options.reorderLiClass = options.reorderLiDef.slice(1)
            }
        }else{
            options.attrForNum = ''
        }
        if (!options.divTemplateId) {
            options.divTemplateId = '#next-' + options.currentname + '-div'
        }
        // SETUP private functions;
        var intialize = function () {

            //Add another section when start typing on the trigger add
            $(base).on('keyup', options.termToAdd, function () {
                console.log('adddd')
                var _self = $(this);
                var currentLi = _self.parents(options.sectionDefType);
                currentLi.removeClass(options.classDefNewSec);
                var removeObj = currentLi.find(options.removeTrigger);
                if (_self.val() == '') {
                    //if it's the last remove it from the order list
                    if (options.isOrder && _self.is($(options.termToAdd + ':visible').eq(-2))) $('.order-drop').find(options.reorderLiDef + ' :last').remove();
                    $(base).find('.' + options.classDefNewSec).remove();
                    currentLi.addClass(options.classDefNewSec);
                    removeObj.addClass('noDisplay')
                }
                else if (!$(base).find('.' + options.classDefNewSec).length) {
                    createAnother();
                    removeObj.removeClass('noDisplay');
                }
            });
            //Add Handler for remove section
            $(base).on('click', options.removeTrigger, function () {
                removeSection('#' + $(this).parents(options.listDef).prop('id'))
            });
            // when removing partner from the list
            // also remove the last order and reorder the drop down
            function removeSection(idToRemove) {
                $(idToRemove).hide('100', function () {
                    if (options.isOrder) {
                        $(base).find(options.listDef + ' .order-drop').find(options.reorderLiDef + ' :last').remove();
                    }
                    console.log('delettteeeee')
                    var valDeleted = $(idToRemove).find('input').val();
                    if ($(this).hasClass('default')) {
                        $(this).hide().addClass('remove')
                    } else {
                        $(this).remove();
                    }
                    options.callbackDelete(idToRemove,valDeleted);
                    //update the other numbers
                    if (options.isOrder) {
                        $(options.numberClass + ':visible').each(function (k, v) {
                            $(v).text(k + 1);
                            var orderDrop = $(v).parents(options.listDef).find('.order-drop');
                            orderDrop.find('.default').removeClass('default active');
                            orderDrop.find('[title=' + (k + 1) + ']').addClass('default active');
                        })
                    }
                })
            }

            //create new Section
            //and add this num to the dropdown
            function createAnother() {
                var nextDivCount = options.attrForNum ? parseInt($(base).find(options.termToAdd + ':visible:last').attr(options.attrForNum)) + 1 : $(base).find(options.termToAdd).length;
                var nextIndexForShow = $(base).find(options.listDef + ':visible').length + 1;
                var textToReplace = /next-div-count/g;
                var next_div = $(options.divTemplateId).html().replace(textToReplace, nextDivCount);
                $(next_div).addClass(options.classDefNewSec).insertAfter($(base).find(options.listDef + ':visible:last')).hide().show('slow');
                //if it's order list init the orders
                if (options.isOrder) {
                    var orderDrop = $(base).find('.order-drop');
                    //if it's first time added add the last to the order list
                    if (!orderDrop.find('[title=' + (nextIndexForShow - 1) + ']').length) {
                        orderDrop.append('<li class=' + options.reorderLiClass + '><a href="javascript:void(0)" class=' + options.reorderClass + ' title=' + (nextIndexForShow - 1) + '>' + (nextIndexForShow - 1) + '</a></li>')
                        $(options.listDef + ':visible .order-drop:nth(-2)').find(options.reorderDef + ':last').addClass('default active');
                    }
                    $(base).find('.' + options.classDefNewSec + ' ' + options.numberClass).text(nextIndexForShow);
                }
                console.log('index----'+nextDivCount)
                options.callbackAnother(nextDivCount);
            }

            if (options.isOrder) {

                //reorder the sections
                $(base).on('click', options.reorderDef + ':not(active)', function () {
                    var originalIndex = parseInt($(this).parent().parent().find('.default').text());
                    var currentIndex = parseInt($(this).text());
                    var partnersList = $(options.listDef + ':visible');
                    //init the val to show
                    var currentObj = partnersList.eq(originalIndex - 1);
                    var newObj = partnersList.eq(currentIndex - 1);
                    if (originalIndex < currentIndex) {
                        currentObj.insertAfter(newObj).hide().show('slow');
                    } else {
                        currentObj.insertBefore(newObj).hide().show('slow');
                    }

                    $(this).parents('.dropdown-nav').hide();
                    updateSectionValues();
                    //change values-change other default and active
                }).on('click', options.toggleTrigger + ':visible:not(:last)', function () {
                    $(this).siblings('.dropdown').find('.dropdown-nav').toggle();
                })

                //update the names values and names in reorder
                var updateSectionValues = function () {
                    $(base).find(options.listDef + ':not(:last):not(.remove):not(.' + options.classDefNewSec + ')').each(function (k, v) {
                        var currentNumFlag = $(v).find(options.termToAdd);
                        var currentNum = currentNumFlag.attr(options.attrForNum)
                        //update the current num to be the correct order
                        currentNumFlag.attr(options.attrForNum, k);
                        $(v).find('[name*="\[' + currentNum + '\]"]').each(function (kal, val) {
                            var curVal = $(val);
                            var newName = curVal.attr('name').replace('[' + currentNum + ']', '[' + k + ']');
                            var newId = curVal.attr('id').replace(/\d/, k);
                            curVal.attr('name', newName).attr('id', newId);
                        });
                        var newNum = (k + 1)
                        var numShow = $(v).find(options.numberClass);
                        var numNewId = numShow.attr('id').replace(/\d/, k);
                        numShow.attr('id', numNewId).text(newNum);
                        var orderDrop = $(v).find('.order-drop');
                        orderDrop.find('.default').removeClass('default active');
                        orderDrop.find('[title=' + newNum + ']').addClass('default active');
                    })
                }
            }
            return base;
        };
        return intialize();
    }
})(jQuery);