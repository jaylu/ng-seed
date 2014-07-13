/**
 * Home controller definition
 * @scope Controllers
 */
define(['./module'], function (controllers) {
    'use strict';

    controllers.controller('HomeController', ['$scope', function ($scope) {

        var tool = angular;

        $scope.joiners = ['Ellen', 'Moon', 'Ryan'];
        $scope.newJoiner = '';

        $scope.newRecord = {
            item: 'seafood',
            totalAmount: 400,
            payer: 'Ellen',
            detail: [
                {
                    name: 'Ellen',
                    isRelated: true,
                    amount: 200
                },
                {
                    name: 'Moon',
                    isRelated: true,
                    amount: 200
                },
                {
                    name: 'Ryan',
                    isRelated: true,
                    amount: 200
                }
            ]
        };

        $scope.records = [
            {
                item: 'seafood',
                totalAmount: 600,
                payer: 'Ellen',
                detail: [
                    {
                        name: 'Ellen',
                        isRelated: true,
                        amount: 200
                    },
                    {
                        name: 'Moon',
                        isRelated: true,
                        amount: 200
                    },
                    {
                        name: 'Ryan',
                        isRelated: true,
                        amount: 200
                    }
                ]
            },
            {
                item: 'Bus',
                totalAmount: 300,
                payer: 'Moon',
                detail: [
                    {
                        name: 'Ellen',
                        isRelated: true,
                        amount: 100
                    },
                    {
                        name: 'Moon',
                        isRelated: true,
                        amount: 100
                    },
                    {
                        name: 'Ryan',
                        isRelated: true,
                        amount: 100
                    }
                ]
            }

        ];

        $scope.summaries = [];


        var findIndex = function (objectArray, fieldName, value) {
            var indexToReturn;
            objectArray.forEach(function (object, index) {
                if (object[fieldName] && object[fieldName] === value) {
                    indexToReturn = index;
                }
            });
            return indexToReturn;
        };

        var refreshSummary = function () {
            var joinerSummaryMap = {};
            var latestSummaries = [];

            $scope.joiners.forEach(function (joiner) {
                joinerSummaryMap[joiner] = {
                    totalCostAmount: 0,
                    totalPayedAmount: 0,
                    balance: 0
                }
            });

            $scope.records.forEach(function (record) {

                var payer = record.payer;
                joinerSummaryMap[payer].totalPayedAmount = joinerSummaryMap[payer].totalPayedAmount + parseFloat(record.totalAmount);

                record.detail.forEach(function (detail) {

                    if (detail.isRelated) {
                        var debtParty = detail.name;
                        joinerSummaryMap[debtParty].totalCostAmount = joinerSummaryMap[debtParty].totalCostAmount + parseFloat(detail.amount);
                    }

                });

            });

            $scope.joiners.forEach(function (joiner) {
                latestSummaries.push(
                    {
                        name: joiner,
                        totalCostAmount: joinerSummaryMap[joiner].totalCostAmount,
                        totalPayedAmount: joinerSummaryMap[joiner].totalPayedAmount,
                        balance: joinerSummaryMap[joiner].totalPayedAmount - joinerSummaryMap[joiner].totalCostAmount
                    }
                );
            });

            $scope.summaries = latestSummaries;

        };

        $scope.onJoinerUpdate = function () {
            $scope.records = [];
            refreshSummary();
        };

        $scope.removeJoiner = function (joinerToRemove) {
            var indexInJoiners = $scope.joiners.indexOf(joinerToRemove);
            if (indexInJoiners > -1) {
                $scope.joiners.splice(indexInJoiners, 1);
                $scope.onJoinerUpdate();
            }

            var indexInNewRecord = -1;
            $scope.newRecord.detail.forEach(function (detail, index) {
                if (joinerToRemove === detail.name) {
                    indexInNewRecord = index;
                }
            });

            if (indexInNewRecord > -1) {
                $scope.newRecord.detail.splice(indexInNewRecord, 1);
            }
        };

        $scope.addJoiner = function (newJoiner) {


            if ($scope.newJoiner) {

                var isExist = false;
                $scope.joiners.forEach(function (existingJoiner) {
                    if (existingJoiner === newJoiner) {
                        isExist = true;
                    }
                });

                if (!isExist) {
                    $scope.joiners.push($scope.newJoiner);
                    $scope.newRecord.detail.push(
                        {
                            name: newJoiner,
                            isRelated: false,
                            amount: 0
                        }
                    );
                    $scope.onJoinerUpdate();
                    $scope.newJoiner = '';
                }

            }

        };

        $scope.addNewRecord = function (newRecord) {
            $scope.records.push(tool.copy(newRecord));
            refreshSummary();
        };

        $scope.removeRecord = function(index) {
            $scope.records.splice(index, 1);
            refreshSummary();
        };

        $scope.onTotalAmountChange = function () {
            var newRecord = $scope.newRecord;

            var totalAmount = newRecord.totalAmount;

            var relatedJoinerCount = 0;
            newRecord.detail.forEach(function (detail) {
                if (detail.isRelated === true) {
                    relatedJoinerCount++;
                }
            });

            var averageAmount = totalAmount / relatedJoinerCount;
            newRecord.detail.forEach(function (detail) {
                if (detail.isRelated === true) {
                    detail.amount = averageAmount.toFixed(2);
                }
            });

        };

        $scope.onSingleCheckedChange = function (joiner, isChecked) {

            var newRecord = $scope.newRecord;

            newRecord.detail.forEach(function (detail) {
                if (joiner === detail.name && detail.isRelated === false) {
                    detail.amount = 0;
                }
            });


            if (isChecked) {
                $scope.onSingleAmountChange();
            } else {
                $scope.onTotalAmountChange();
            }

        };

        $scope.onSingleAmountChange = function () {

            var newRecord = $scope.newRecord;

            var totalAmount = 0;
            newRecord.detail.forEach(function (detail) {
                if (detail.isRelated === true && detail.amount) {
                    totalAmount = totalAmount + parseFloat(detail.amount);
                }
            });

            $scope.newRecord.totalAmount = totalAmount;

        };

        $scope.$watch('joiners.length', $scope.onTotalAmountChange);

    }]);

});
