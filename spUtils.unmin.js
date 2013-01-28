/*
 * spUtils - v 1.1
 * http://sputils.codeplex.com
 *
 * Open source under the MIT license
 *
 * Copyright (c) 2011-2012, Matthew Bramer
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *   - Neither the name of the author nor the names of its contributors
 *     may be used to endorse or promote products derived from this
 *     software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
*/

(function( window ) {
	// Use the correct document accordingly with window argument (sandbox)
	//var document = window.document,
	//	navigator = window.navigator,
	var _spUtils = "spUtils",
		location = window.location,
		_privy = "_spUtilsUnderscoredForAReason",
		_internalProps = {}
	; //local vars

	_internalProps[ _privy ] = {
		//Used for internal properties of spUtils
		"_spBodyOnLoadFunctionNamesQueued" : false,
		"onLoadFunctions" : [],
		$formNodes : {}
	};

	//console.dir( _spBodyOnLoadFunctionNames );

	/*
		////
		//	Dynamically load jQuery
		////
				var re = document.createElement('script'); re.type = 'text/javascript'; re.async = true;
				re.src = url_;
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(re, s);


		var jQueryScript = document.createElement("script");
							jQueryScript.type = "text/javascript";
							jQueryScript.src = “/_layouts/MyJSPath/myjsfile.js;
							document.getElementsByTagName("head")[0].appendChild(jQueryScript);



		Figure this out later

		if ( typeof $ === 'undefined' ) {
			//Borrowed from HTML5 Boilerplate
			var g=document.createElement( 'script' ),
				s=document.getElementsByTagName( 'script' )[ 0 ]
			;//local vars

			g.src='//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
			s.parentNode.insertBefore( g, s );
		}
	*/
	
	// Sanbox SharePoint variables
	var executeScript = ExecuteOrDelayUntilScriptLoaded,
		//Booleans for environment checking
		isJquery = ( $ || window.jQuery ) ? true : false,
		isSP2010 = ( typeof executeScript === 'function' ) ? true : false,
		isSP2013 = false,
		// isRoboCAML = ( window.roboCAML ) ? true : false,

		// Used to search Static Names that are labeled as lookups.
		rLookupCheck = /\{L\}/i,
		// Used to search Static Names that are labeled as people pickers.
		rPeoplePicker = /\{P\}/i,

		/***********************************************************
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~Private methods~~~~~~~~~~~~~~
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		***********************************************************/
		/***********************************************************
			Initialize method ~ loops through onLoadFunctions array and fires cached spUtils call(s) after sp.js has been loaded.
		***********************************************************/
		init = function( onLoadFunctions ) {
			//debugger;
			for( var i = 0; i<onLoadFunctions.length; i=i+2 ) {
				//var expr="if ( typeof (" + onLoadFunctions[ i ] + ") == 'function') {(" + onLoadFunctions[ i ] + "(" + eval( onLoadFunctions[ i + 1 ] ) + "));}";
				//log( expr );
				//eval( expr );
				onLoadFunctions[ i ]( onLoadFunctions[ i + 1 ] );
			}
		},
		cacheFormNodes = function() {
			if ( "length" in _internalProps[ _privy ].$formNodes && _internalProps[ _privy ].$formNodes.length > 0 ) {
				// form already cached, lets return that.
				return _internalProps[ _privy ].$formNodes;
			} else {
				// cache form nodes first time.
				return _internalProps[ _privy ].$formNodes = $("td.ms-formbody");
			}
		},
		/***********************************************************
			Used to cache spUtil calls until sp.js has been loaded
			// Look to refactor this using .apply() or .call() on cacheSpUtilsCall
		***********************************************************/
		cacheSpUtilsCall = function( cachedFunc, options ) {
			if ( typeof SP === "undefined" || typeof SP.ClientContext !== "function" || typeof SP.CamlQuery !== "function" ) {
				_internalProps[ _privy ].onLoadFunctions.push( cachedFunc, options );
				return true;
			}
		},
		rescapeColumnName = function( opt ) {
			var colNameEscapedForRegex = opt.columnName.replace( /([.?*+^$\\(){}-])/g, '\\$1' ), // Escape chars for rcolumnName
				rcolumnName = new RegExp( "FieldName=\"" + colNameEscapedForRegex + "\"", "i" )

			;
			return rcolumnName;
		},
		findFormControl = function( opt, $inputCtrl, $selectCtrl ) {
			// Function notes
			// Not sure if $inputCtrl or $selectCtrl are needed.

			//http://sputility.codeplex.com/documentation?referringTitle=Home <--- Got a few more to do with calendars.
			//<!-- FieldName="Title" FieldInternalName="Title" FieldType="SPFieldText" --> ~ Single line text box
			//<!-- FieldName="Priority" FieldInternalName="Priority" FieldType="SPFieldChoice" --> ~ Choice column
			//<!-- FieldName="Contact Sources" FieldInternalName="ContactSources" FieldType="SPFieldMultiChoice" --> ~ Choice column checkboxes
			//<!-- FieldName="Assigned To" FieldInternalName="AssignedTo" FieldType="SPFieldUser" --> ~ People picker
			//<!-- FieldName="Description" FieldInternalName="Comment" FieldType="SPFieldNote" --> All multi lines of text
			//<!-- FieldName="Related Issues" FieldInternalName="RelatedIssues" FieldType="SPFieldLookupMulti" --> MultiLookup
			//<!-- FieldName="Related Project" FieldInternalName="RelatedProject" FieldType="SPFieldLookup" --> Single Lookup
			//<!-- FieldName="Due Date" FieldInternalName="DueDate" FieldType="SPFieldDateTime" --> Date/Time
			//<!-- FieldName="All Day Event" FieldInternalName="fAllDayEvent" FieldType="SPFieldAllDayEvent" --> Calendaring
			//<!-- FieldName="Recurrence" FieldInternalName="fRecurrence" FieldType="SPFieldRecurrence" --> Calendaring
			//<!-- FieldName="Workspace" FieldInternalName="WorkspaceLink" FieldType="SPFieldCrossProjectLink" --> Calendaring

			var columnDetails = opt.columnDetails,
				returnValue

			;

			switch( columnDetails.columnType.toLowerCase() ) {
				case "spfieldtext" :
					$inputCtrl.val( opt.value );
					returnValue = opt.value || $inputCtrl.val();

					return {
						row : $inputCtrl.closest("tr"),
						control : $inputCtrl,
						value : returnValue
					};

				case "spfieldchoice" :

					var $closestTable,
						$closestTd = $columnNode.closest("td.ms-formbody"),
						$selectCtrl = safeSelector( "select", opt.columnName, $closestTd ),
						singleDdl = $selectCtrl.length === 1,
						$ctrl = ( $closestTd.find("table:first").length > 0 ) ? $closestTd.find("table:first") : $selectCtrl,
						$fillOutChoice = safeSelector( "select", opt.columnName + ": Choice Drop Down", $closestTd ),

						// Booleans.
						radioBtnsFound = $fillOutChoice.length === 0 && $ctrl.length > 0,
						fillOutChoiceFound = $fillOutChoice.length === 1
					;

					// Simple drop down control w/ no fill-in option
					if ( singleDdl ) {
						$selectCtrl.val( opt.value );
						returnValue = opt.value || $selectCtrl.val();

						return {
							row : $closestTd.closest("tr"),
							control : $ctrl,
							value : returnValue
						};
					}

					// Radio button controls found
					if ( radioBtnsFound ) {
						safeSelector( "span", opt.value, $ctrl )
							.find("input")
							.prop("checked", true);

						returnValue = opt.value || $ctrl.find("input[type='radio']:checked").val();

						return {
							row : $closestTd.closest("tr"),
							control : $ctrl,
							value : returnValue
						};
					}

					// Fill in choice found.
					if ( fillOutChoiceFound ) {
						$fillOutChoice.val( opt.value );
						returnValue = $fillOutChoice.val();

						if ( $fillOutChoice.val() !== opt.value ) {
							$ctrl
								.find("input[value='FillInButton']")
								.prop('checked', true)
							;

							// ugly, I know... :D
							returnValue = safeSelector( "input", opt.columnName + " : Specify your own value:", $ctrl );
							returnValue.val( opt.value );
						}

						// ugly, I know... :D
						returnValue = opt.value || returnValue.val();

						return {
							row : $closestTd.closest("tr"),
							control : $ctrl,
							value : returnValue
						};
					}

					// Nothing found. Needed for opt.debug mode.
					return undefined;

				case "spfieldmultichoice" :

					debugger;

					// COMMENT THIS FIELD...
					// I DON"T KNOW WHAT THIS DOES... <--- Me @ 2 a.m. leaving a note for myself. ;D
					var $container = columnDetails.$columnNode.closest("td.ms-formbody"),
						isChecked = opt.check === true
					;

					for ( var i = 0; i < opt.value.length; i++ ) {
						$container.find("span[title='" + opt.value[ i ] + "'").hide() // > input:first")
							//.prop("checked", isChecked);
					}
					return {
						row: $container.closest("tr"),
						control: $container,
						value :
					};

				case "spfielduser" :
					var $row = columnDetails.$columnNode.closest("tr"),
						$control = $row.find("div[title='People Picker']"),
						$checkNames = $row.find("img[Title='Check Names']:first")
					; //local vars

					if ( opt.value.length > 0 ) {
						$control.html( opt.value );
					}

					if ( opt.checkNames ) {
						$checkNames.click();
					}

					return {
						row : $row,
						control : $control,
						checkNames : $checkNames
					};

				case "spfieldnote" :
					var $textArea = safeSelector( "textarea", opt.columnName ),
						$thisRow = $textArea.closest("tr")
					; //local vars

					$textArea.val( opt.value );

					return {
						row : $thisRow,
						control : $textArea
					};

				case "spfieldlookupmulti" :
					var $multiSelectCtrl = safeSelector( "select", opt.columnName + " possible values" );
						//$("select[title='" + opt.columnName + " possible values']"),
						$selectedValues = safeSelector( "select", opt.columnName + " selected values" );
						//$("select[title='" + opt.columnName + " selected values']"),
						$addButton = $multiSelectCtrl.closest("tr").find("button[id$='AddButton']"),
						$removeButton = $multiSelectCtrl.closest("tr").find("button[id$='RemoveButton']")
						//optionsToSelect = []
					; //local vars

					if ( opt.value.length > 0 ) {
						$multiSelectCtrl.find("option").each(function( i, el ) {
							var $this = $( this ),
								optionText = $this.text().substring( $this.text().indexOf(" - ") + 3 )
							; //local vars

							// .shift() array values off to save some loops.
							if ( $.inArray( optionText, opt.value ) > -1 ) {
								el.selected = true;
								opt.value.shift();
							}

							//Check here to see if array has any other values. If not, save time by dropping the $.each() iteration.
							if ( opt.value.length === 0 ) {
								return false;
							}
						});
					}


					if ( opt.removeSelected ) {
						$selectedValues.find("option").each(function( i, el ) {
							var $this = $( this ),
								optionText = $this.text().substring( $this.text().indexOf(" - ") + 3 )
							; //local vars

							//Remove only the values passed in or remove them all...
							if ( opt.value > 0 ) {
								// .shift() array values off to save some loops.
								if ( $.inArray( optionText, opt.value ) > -1 ) {
									el.selected = true;
									opt.value.shift();
								}

								//Check here to see if array has any other values. If not, save time by dropping the $.each() iteration.
								if ( opt.value.length === 0 ) {
									return false;
								}
							} else {
								el.selected = true;
							}
						});

						//Click that button yo.
						$removeButton.click();
					}

					if ( opt.addSelected ) {
						$addButton.click();
					}

					return {
						row : $multiSelectCtrl.closest("span").closest("tr"),
						possibleValues : $multiSelectCtrl,
						selectedValues : $selectedValues,
						addButton : $addButton,
						removeButton : $removeButton
					};

				case "spfieldlookup" :
					var returnObj = {
						row : null,
						control: null
					};

					if ( $selectCtrl.length ) {
						$selectCtrl.val( opt.value );

						returnObj.control = $selectCtrl;
						returnObj.row = $selectCtrl.closest("tr");

					} else if ( $inputCtrl.length ) {
						choices = $inputCtrl.attr("choices");
						hiddenInput = $inputCtrl.attr("optHid");
						$("input[id='" + hiddenInput + "']").attr( "value", opt.value );

						choiceArray = choices.split("|");
						for ( index = 1; index < choiceArray.length; index = index + 2 ) {
							if ( choiceArray[ index ] == opt.value ) {
								$inputCtrl.val( choiceArray[ index - 1 ] );
							}
						}

						returnObj.control = $inputCtrl;
						returnObj.row = $inputCtrl.closest("tr");
					}

					return returnObj;

				case "spfielddatetime" :
					$inputCtrl.val( opt.value.date );
					$inputCtrl.closest("tr")
						.find("select[id$='DateTimeFieldDateHours']")
						.val( opt.value.hour.toUpperCase() );
					$inputCtrl.closest("tr")
						.find("select[id$='DateTimeFieldDateMinutes']")
						.val( opt.value.minutes );

					return {
						row : $inputCtrl.closest("tr"),
						control : $inputCtrl
					};
				/*/ Calendaring /*/
				case "spfieldalldayevent" :
					$inputCtrl = $formBody.find("input[id$='AllDayEventField']");
					var isChecked = $inputCtrl.is(":checked"),
						value = ( opt.value == 1 || opt.value === true || opt.value.toLowerCase() === "on" ) ? true : false
					;

					if ( !isChecked && value ) {
						$inputCtrl.click();
					} else if ( isChecked && !value ) {
						$inputCtrl.click();
					}

					return {
						row : $inputCtrl.closest("tr"),
						control : $inputCtrl
					};
				case "spfieldrecurrence" :
					$inputCtrl = $formBody.find("input[id$='RecurrenceField']");
					var isChecked = $inputCtrl.is(":checked"),
						value = ( opt.value == 1 || opt.value === true || opt.value.toLowerCase() === "on" ) ? true : false
					;

					if ( !isChecked && value ) {
						$inputCtrl.click();
					} else if ( isChecked && !value ) {
						$inputCtrl.click();
					}

					return {
						row : $inputCtrl.closest("tr"),
						control : $inputCtrl
					};

				case "spfieldcrossprojectlink" :
					$inputCtrl = $formBody.find("input[id$='CrossProjectLinkField']");
					var isChecked = $inputCtrl.is(":checked"),
						value = ( opt.value == 1 || opt.value === true || opt.value.toLowerCase() === "on" ) ? true : false
					;

					if ( !isChecked && value ) {
						$inputCtrl.click();
					} else if ( isChecked && !value ) {
						$inputCtrl.click();
					}
/*
					if ( isChecked && value ) {
						$inputCtrl.prop("checked", false);
					} else {
						$inputCtrl.prop("checked", true);
					}
*/
					return {
						row : $inputCtrl.closest("tr"),
						control : $inputCtrl
					};
				/*/ End Calendaring /*/
				default :
					throw new Error();
			}
		},
		findList = function( ctx, listName ) {
			return ctx.get_web().get_lists().getByTitle( listName );
		},
		getColumnDetails = function( opt ) {
			var $columnNode,
				columnComment,
				fieldTypeFound,
				columnType,
				rcolumnName = rescapeColumnName( opt )

			;
			// var from method:
			//

			$columnNode = opt.$formBody.contents()
				.filter(function() {
					return this.nodeType === 8 && rcolumnName.test( this.nodeValue );
				});

			columnComment = $columnNode[ 0 ].nodeValue.trim();
			//Need to return SPFieldText or whatever it may be...
			fieldTypeFound = columnComment.indexOf("FieldType=\"") + 11; //11 is added so the text will start with the "type" of column text.

			while( fieldTypeFound ) {
				if ( columnComment.charAt( fieldTypeFound ) === "\"" ) {
					break;
				}
				columnType += columnComment.charAt( fieldTypeFound );
				fieldTypeFound++;
			}

			return {
				$columnNode : $columnNode,
				columnComment : columnComment,
				columnType : columnType
			};
		},
		getListItemsSucceeded = function( data, ctx ) {

			//debugger;
			var enumerator = ctx.getEnumerator(),
				listData = ctx.get_data()

			; //local vars

			//debugger;

			while ( enumerator.moveNext() ) {
				var listItem = enumerator.get_current();

				// Here's your chance to do something awesome...
				log( listItem.get_item( "Title" ) );
			}
		},
		noop = function() {
			//Nothing to see here!
		},
		spCsomError = function( sender, error ) {
			//debugger;

			var msg = 'Request failed. ' + error.get_message();

			if ( error.get_stackTrace() ) {
				msg += '\n' + error.get_stackTrace();
			}

			log( msg );
		},
		// Determines what type of parameter is being passed
		// http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
		toType = function( obj ) {
			return ( {} ).toString.call( obj ).match(/\s([a-zA-Z]+)/)[ 1 ].toLowerCase();
		},
		// Allows jQuery selectors to handle special characters.
		safeSelector = function( el, columnName, context ) {
			if ( typeof context === "undefined" ) {
				return $( el ).filter( function() { return this.title === columnName; });
			}

			return context.find( el ).filter( function() { return this.title === columnName; });
		},
		setColumnVal = function( staticName, itemValue, listItem ) {
			// Used in conjuction with CSOM calls.  May have to rename to something more intuitive.
			var result = false

			; //local vars

			if ( rLookupCheck.test( staticName ) ) {
				//Lookup field needs to be catered using FieldLookUp value
				//Also multiItemLookup fields need to have an array of new SP.FieldLookupValue().
				//So we'll just make all lookups use lookupValueContainer
				var lookupValueContainer = [],
					// Coerce into string and then split. Prevents error when one lookup id is passed as a number.
					values = itemValue + "",
					values = values.split(";#"),
					c = 0
				;

				for ( ; c < values.length; c++ ) {
					var lookupValue = new SP.FieldLookupValue();
					lookupValue.set_lookupId( values[ c ] );

					lookupValueContainer.push( lookupValue );
				}

				listItem.set_item(
					//Trim off {*} delimiter
					staticName.split("{")[ 0 ],
					lookupValueContainer
				);

			} else if ( rPeoplePicker.test( staticName ) ) {
				//http://msdn.microsoft.com/en-us/library/ee658862 ---> for name(s)
				//http://msdn.microsoft.com/en-us/library/ee549608 ---> for Id(s)
				//People picker field needs to be catered using SP.FieldUserValue.
				//Also multiItemLookup fields need to have an array of new SP.FieldLookupValue().
				//So we'll just make all lookups use lookupValueContainer
				var lookupValueContainer = [],
					// Coerce into string and then split. Prevents error when one lookup id is passed as a number.
					values = itemValue + "",
					values = values.split(";#"),
					c = 0
				;

				for ( ; c < values.length; c++ ) {
					var lookupValue
					; //local vars

					if ( isNaN( values[ c ] ) ) {
						// Is string and needs to be set using this method.
						lookupValue = SP.FieldUserValue.fromUser( values[ c ] );
					} else {
						// Is number/string lookupId whatev... Use this method yo.
						lookupValue = new SP.FieldUserValue();
						lookupValue.set_lookupId( values[ c ] );
					}

					lookupValueContainer.push( lookupValue );
				}

				listItem.set_item(
					//Trim off {*} delimiter
					staticName.split("{")[ 0 ],
					lookupValueContainer
				);

			} else {
				listItem.set_item( staticName, itemValue );
			}
		},
		/***********************************************************
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~~Public methods~~~~~~~~~~~~~
		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		***********************************************************/
		addStatus = function( message, color, callback ) {
			var opt;

			// Look to refactor this using .apply() or .call() on cacheSpUtilsCall
			if ( toType( message ) !== "object" ) {
				opt = {
					message : message,
					color : color,
					callback : callback
				};
			} else {
				opt = message;
			}

			if ( cacheSpUtilsCall( addStatus, opt ) ) {
				return;
			}

			var statusId = SP.UI.Status.addStatus( opt.message );

			// http://msdn.microsoft.com/en-us/library/ff408240.aspx
			if ( opt.color ) {
				SP.UI.Status.setStatusPriColor( statusId, opt.color );
			}

			if ( toType( opt.callback ) === "function" ) {
				opt.callback( statusId );
			} else {
				return statusId;
			}
		},
		closeDialog = function( result ) {
			// SP.UI.DialogResult.OK
			// SP.UI.DialogResult.Cancel
			SP.UI.ModalDialog.commonModalDialogClose( result );
		},
		createCallback = function( ctx, a ) {
			return function () {
				var argLength = arguments.length;
				if ( argLength > 0 ) {
					var d = [];
					for ( var i = 0; i < argLength; i++ ) {
						d[ i ] = arguments[ i ];
						d[ argLength ] = a;
						return ctx.apply( this, d );
					}
				}
				return ctx.call( this, a );
			};
		},
		createDelegate = function( a, b ) {
			return function() {
				return b.apply( a, arguments );
			};
		},
		createListItems = function( options ) {
			var opt = options || {};

			if ( cacheSpUtilsCall( createListItems, opt ) ) {
				return;
			}

			// Get the current context
			var context = getWebURL( opt.webUrl ),
                targetList = findList( context, opt.listName ),
				successCallback = opt.success || noop,
				errorCallback = opt.error || spCsomError

			; //local vars


			//debugger;


			for ( var i = 0; i < opt.updates.length; i++ ) {
				// create the ListItemInformation object
				var listItemInfo = new SP.ListItemCreationInformation(),
					// add the item to the list
					listItem = targetList.addItem( listItemInfo ),
					itemVals = opt.updates[ i ]
				; //local vars

				// SP.ListItemCreationInformation.set_folderUrl()
				// http://msdn.microsoft.com/en-us/library/ee548300
				if ( itemVals.hasOwnProperty("folderUrl") ) {
					listItemInfo.set_folderUrl( itemVals.folderUrl );
					delete itemVals.folderUrl;
				}
				// SP.ListItemCreationInformation.set_folderUrl()
				// http://msdn.microsoft.com/en-us/library/ee548300
				// http://spservices.codeplex.com/discussions/79668 <--- a golden oldie
				if ( itemVals.hasOwnProperty("folderName") ) {
					//Handles discrepencies when folder is based off a content type. You Are Welcome...
					if ( itemVals.hasOwnProperty("ContentTypeId") ) {
						listItemInfo.set_underlyingObjectType( SP.FileSystemObjectType.folder );
					}

					listItemInfo.set_leafName( itemVals.folderName );
					itemVals.FSObjType = 1;
					itemVals.BaseName = itemVals.folderName;
					delete itemVals.folderName;
				}

				//Iterate the rest of the properties and set the column values accordingly.
				for ( var staticName in itemVals ) {
					if ( itemVals.hasOwnProperty( staticName ) ) {
						setColumnVal( staticName, itemVals[ staticName ], listItem );
					}
				}

				listItem.update();
			}

			//Make a query call to execute the above statements
			context.executeQueryAsync(
				Function.createDelegate( this, successCallback ),
				Function.createDelegate( this, errorCallback )
			);
		},
		deleteListItems = function( options ) {
			var opt = options || {};

			if ( cacheSpUtilsCall( deleteListItems, opt ) ) {
				return;
			}

			//Get the current client context and list
			var context = getWebURL( opt.webUrl ),
				targetList = findList( context, opt.listName ),
				typeOfDeletion = toType( opt.id ),
				i=0,
				listItem,
				successCallback = opt.success || noop,
				errorCallback = opt.error || spCsomError
			; //local vars

			if ( typeOfDeletion === "number" ) {
				listItem = targetList.getItemById( opt.id );
				listItem.recycle();
			} else {
				for ( ; i<opt.id.length; i++ ) {
					listItem = targetList.getItemById( opt.id[ i ] );
					listItem.recycle();
				}
			}

			context.executeQueryAsync(
				Function.createDelegate( this, successCallback ),
				Function.createDelegate( this, errorCallback )
			);
		},

/*
	Implement after full testing.
		getFormControl = function( columnName ) {
			$(".ms-standardheader > nobr").filter(function() {
				return $(this).text() === columnName;
			});
		},
*/

		getFormValue = function( options ) {
			var defaults = {
					value : "",
					selector : options.columnName.replace(/[#;&,.+*~':"!^$[\]()=>|\/]/g, "\$&"), // escape chars for jQuery selector
					cacheForm : true,
					debug : false
				},
				opt = $.extend({}, defaults, options),
				$formBody

			;

			if ( opt.cacheForm ) {
				$formBody = cacheFormNodes();
			} else {
				// serve up some fresh DOM. Useful for forms that have nodes added/removed
				$formBody = $("td.ms-formbody");
			}

			return

/*
			var ddlVal = $("select, input").filter(function(e) {
				return this.title === columnName;
			}).val();


			if ( ddlVal === undefined ) {
				ddlVal = $("input[title='" + columnName + "']").val();
			}

			return ddlVal;

*/
		},





		//GetList Op??? Where you @?
/*
console.dir( list );
//console.dir( list.get_fields() );
//console.dir( list.get_views() );
//console.dir( list.get_dataSource() );
//console.dir( list.get_id() );
/*
var clientContext = new SP.ClientContext.get_current(),
	web = clientContext.get_web(),
   	listCollection = web.get_lists();

//console.dir( listCollection );


            clientContext.load(this.listCollection);
            clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));


    function onQuerySucceeded() {
	debugger;
        var listInfo = 'Lists on the current site:' + '\n\n';
        var listEnumerator = this.listCollection.getEnumerator();
        while (listEnumerator.moveNext()) {
            var list = listEnumerator.get_current();
            listInfo += list.get_title() + '\n';
        }
        alert(listInfo);
    }

    function onQueryFailed(sender, args) {
        alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    }

*/



		getListItems = function( options ) {
			/* Valid options
			* webUrl, listName, CAMLQuery, Folder, Include, success, error, debug
			*/

/*
			var opt = ( toType( options ) === "array" ) ?
				opt = options :
				Array.prototype.slice.call( arguments ) || {}
			;
*/
			var opt = options || {},
				context,
				i = 0
			;
			//log("in GetListItems: " + options.listName );
			//console.dir( SP );
			//debugger;

			if ( "batch" in opt === false ) {
				opt.batch = [ opt ];
			}

			if ( cacheSpUtilsCall( getListItems, opt ) ) {
				return;
			}

			//Get the current client context
			context = getWebURL( opt.webUrl );

			for( ; i<opt.batch.length; i++ ) {
				var listOptions = opt.batch[ i ],
					targetList,
					camlQuery,
					includeFields = "Include(",
					loopLength,
					successCallback,
					errorCallback
				; //local vars

				try {
					//debugger;
					targetList = findList( context, listOptions.listName );

					//CAML Query
					if ( listOptions.hasOwnProperty("CAMLQuery") ) {
						camlQuery = new SP.CamlQuery();
						camlQuery.set_viewXml( listOptions.CAMLQuery );
					} else {
						camlQuery = SP.CamlQuery.createAllItemsQuery();
					}

					//Folder options
					if ( listOptions.hasOwnProperty("Folder") ) {
						camlQuery.set_folderServerRelativeUrl( listOptions.Folder );
					}

					//log( SP.CamlQuery.get_viewXml() );
					//debugger;

					//Create stub for the biznass end of getListItems
					listOptions.listItems = {};
					listOptions.listItems = targetList.getItems( camlQuery );


					//Fields retrieved using Include technique
					if ( listOptions.hasOwnProperty("Include") ) {
						loopLength = listOptions.Include.length;

						while ( loopLength-- ) {
							//log( listOptions.Include[ loopLength ] );
							includeFields += listOptions.Include[ loopLength ];

							if ( loopLength !== 0 ) {
								includeFields += ",";
							}
							//log( loopLength );
						}

						includeFields += ")"; //Close Include
						context.load( listOptions.listItems, includeFields );
					} else {
						context.load( listOptions.listItems );
					}
				} catch ( e ) {
					if ( opt.debug ) {
						log( e );
					}
				}
			}
			//console.dir( opt );
			//debugger;
			errorCallback = opt.error || spCsomError;
			// Set up success callback. Wraps the success property with a function and injects two parameters into the callback.
			// Also iterate listItemData to return an array of objects to callback function.
			successCallback = opt.success || getListItemsSucceeded;
			opt.success = function() {
				debugger;

				// Need to fix this... Can't access listItems if a batch is sent.
				var listItems = opt.listItems,
					listItemsData = listItems.get_data(),
					data = []

				; //local vars

				for ( var prop in listItemsData ) {
					if ( listItemsData.hasOwnProperty( prop ) ) {
						//console.dir( listItemsData[ prop ].get_fieldValues() );
						data.push( listItemsData[ prop ].get_fieldValues() );
					}
				}


				successCallback( data, listItems );
			};

			context.executeQueryAsync(
				Function.createDelegate( this, opt.success ),
				Function.createDelegate( this, errorCallback )
			);
		},
		getProp = function( prop ) {
			var arrOfProps = prop.split("."),
				arrOfPropsLength = arrOfProps.length,
				i,
				returnVal = _internalProps[ prop ]

			;//local vars

			// Loop through dot notation of string passed in. End result = last property of string
			if ( arrOfPropsLength ) {
				for ( i=1; i<=arrOfPropsLength; i++ ) {
					returnVal = _internalProps[ arrOfProps[ arrOfPropsLength -1 ] ];
				}
			}

			return returnVal;
		},
		// http://stackoverflow.com/questions/647259/javascript-query-string
		getQueryString = function() {
			var result = {}, queryString = location.search.substring(1),
				re = /([^&=]+)=([^&]*)/g,
				m;

			while ( m = re.exec( queryString ) ) {
				result[ decodeURIComponent( m[ 1 ] ) ] = decodeURIComponent( m[ 2 ] );
			}
			return result;
		},
		getWebURL = function( webURL ) {



		/* WORK IN PROGRESS...

			// Can 2010 actually pull from a different web?

		*/

			return ( webURL ) ?
				//LOOK INTO .AppContextSite
				// http://blog.appliedis.com/2012/12/19/sharepoint-2013-apps-accessing-data-in-the-host-web-in-a-sharepoint-hosted-app/
				// currentcontext = new SP.ClientContext.get_current();
				// new SP.AppContextSite(currentcontext, hostUrl);
				SP.ClientContext( webURL ) :
				SP.ClientContext.get_current();
		},


/*

		getUniqueItems = function( opt ) {

			Need to resolve:
				weburl
				listId [guid]
				staticName
				viewId [guid] ~ Use default list view unless passed as param



			$.ajax({
				url: weburl+'/_layouts/filter.aspx?ListId='+escape(listId)+'&FieldInternalName='+internalName+'&ViewId='+escape(viewId)+'&FilterOnly=1&Filter=1',
				success: function( status, data ) {
					//Do Something  } });
			//do something awesome

		},



*/

		isoDate = function( d ) {
			//defaults to new date
			d = d || new Date();

			function pad( n ) {
				return n < 10 ? '0' + n : n;
			}

			return d.getUTCFullYear() + '-' +
				pad( d.getUTCMonth() +1 ) + '-' +
				pad( d.getUTCDate() ) + 'T' +
				pad( d.getUTCHours() ) + ':' +
				pad( d.getUTCMinutes() )+ ':' +
				pad( d.getUTCSeconds() )+ 'Z'
			;
		},
		log = function( message ) {
			window.console.log( message );
		},
		notify = function( feedback, persistent ) {
			var opt = {
				feedback: feedback,
				persistent: persistent
			};

			if ( cacheSpUtilsCall( notify, opt ) ) {
				return;
			}

			return SP.UI.Notify.addNotification( opt.feedback, opt.persistent );
		},
		onModalClose = function( dialogResult, returnValue ) {
			var message = ( dialogResult ) ?
				"This item has been saved..." :
				"The modal window has been closed. Nothing has been modified..."
			;

			//alert("dialog result: " + dialogResult );
			spUtils.closeDialog( dialogResult );
			spUtils.notify( message, false );
		},
		openModal = function( options ) {
			/**************************************************************************************************************
			// Why so many options M$? /smh
			// http://msdn.microsoft.com/en-us/library/ff410259
			//
			// Valid options listed here: //http://blogs.msdn.com/b/sharepointdev/archive/2011/01/13/using-the-dialog-platform.aspx
			*************************
			// These options are the bare minimum needed to open a modal dialog.
			// staticListName
			// id
			*************************
			// formType ~ Default: DispForm
			// title
			// url
			// html
			// x ~ Default to center of axis
			// y ~ Default to center of axis
			// width: 800 ~ Default
			// height: 600 ~ Default.
			// allowMaximize: true ~ Default.
			// showMaximized: false ~ Default.
			// showClose: true ~ Default.
			// autoSize: false ~ Default.
			// callback: onModalClose ~ Default.

			********************************************************************
			Use args to pass data to the modal.  Access using: window.frameElement.dialogArgs
			*********************************************************************
			// args: {} ~ Default.
			***************************************************************************************************************/

			// Safeguard the options param
			options = options || {};

			if ( cacheSpUtilsCall( openModal, options ) ) {
				return;
			}
			//url will find current site for each scenario
			var url,
				formType
			; //local vars
			//L_Menu_BaseUrl --- //http://community.zevenseas.com/Blogs/Vardhaman/Lists/Posts/Post.aspx?ID=9

			if ( options.hasOwnProperty("url") ) {
				//Locates full path URL's or relative URL's
				if ( options.url.substring( 0,1 ) === "." || options.url.substring( 0,4 ) === "http" ) {
					url = options.url;
				} else {
					url = L_Menu_BaseUrl + options.url;
				}
				//deletes property to prevent overwriting when extending options
				delete options.url;
			} else {
				switch ( options.formType.toLowerCase() ) {
					case "display":
						formType = "DispForm";
						break;
					case "edit":
						formType = "EditForm";
						break;
					case "new":
						formType = "NewForm";
						break;
					default:
						formType = "DispForm";
						break;
				}

				//Default the base URL to the url variable
				if ( L_Menu_BaseUrl === "" ) {
					url = "/Lists/" + options.staticListName + "/" + formType + ".aspx?ID=" + options.id;
				} else {
					url = L_Menu_BaseUrl + "/Lists/" + options.staticListName + "/" + formType + ".aspx?ID=" + options.id;
				}
			}

			//Rid jQuery dependency on this method...
			var opt = {
				title: options.title || "",
				url: url,
				html: options.html || undefined,
				height: options.height || 600,
				width: options.width || 800,
				allowMaximize: options.allowMaximize || true,
				showMaximized: options.showMaximized || false,
				showClose: options.showClose || true,
				autoSize: options.autoSize || false,
				dialogReturnValueCallback: options.callback || onModalClose,
				//Use args to pass data to the modal.  Access using: window.frameElement.dialogArgs within the form that is being opened.
				args: options.args || {}
			};

			//debugger;
			//Create modal
			SP.UI.ModalDialog.showModalDialog( opt );
		},
		removeNotify = function( id ) {
			SP.UI.Notify.removeNotification( id );
		},
		removeStatus = function( statusId, ms ) {
			ms = ms || 100;

			window.setTimeout(
				function() {
					SP.UI.Status.removeStatus( statusId );
				},
				ms
			);
		},
		startWorkflow = function( options ) {
			var opt = options || {};

			if ( cacheSpUtilsCall( startWorkflow, opt ) ) {
				return;
			}

			var context,
				targetList,
				successCallback,
				errorCallback
			; //local vars

			try {
				//Get the current client context
				context = getWebURL( opt.webUrl );
				targetList = findList( context, opt.listName );

				debugger;
				//console.dir( targetList.get_workflowAssociations().getByName( opt.workflowName ) );
			}
			catch( e ) {

			}
		},
		setFormValue = function( options ) {
			// set lookup ~ inspiration derived from:
			// http://geekswithblogs.net/SoYouKnow/archive/2011/04/06/setting-sharepoint-drop-down-lists-w-jquery---20-items.aspx
			/***** Tweaks *****/
				//No more global variables and needless DOM walking.
				//Selector doesn't break when weird column names are used.

			// people picker ~ inspiration derived from:
			// http://sympmarc.com/2012/04/22/working-with-sharepoint-people-pickers-with-jquery-a-new-function-called-findpeoplepicker/
			/***** Tweaks *****/
				//Made to work with my selector engine.



			var defaults = {
					value : "",
					selector : options.columnName.replace(/[#;&,.+*~':"!^$[\]()=>|\/]/g, "\$&"), // escape chars for jQuery selector
					addSelected : true, //Used with multiSelect controls. Automatically adds selections to the right.
					checkNames: true, //Used with people picker and resolves names.
					freeFormChoiceCtrl: false, //Used with fill in choices. Set to true to find controls like these.
					removeSelected: false, //Used with multi-select controls
					cacheForm : true,
					debug : false
				},
				opt = $.extend({}, defaults, options),
				$formBody,
				$columnNode,
				columnComment,
				columnType = "",

				//Use filter method to prevent issues with special characters and jQuery selectors.
				$selectCtrl = $("select").filter(function(e) {
					return this.title === opt.selector;
				}),
				//Use filter method to prevent issues with special characters and jQuery selectors.
				$inputCtrl = safeSelector( "input", opt.selector ),
				choices,
				hiddenInput,
				choiceArray,
				index,
				fieldTypeFound
			;

			if ( opt.cacheForm ) {
				opt.$formBody = cacheFormNodes();
			} else {
				// serve up some fresh DOM. Useful for forms that have nodes added/removed
				opt.$formBody = $("td.ms-formbody");
			}

			//debugger;

			try {
				opt.columnDetails = getColumnDetails( opt );
				return findFormControl( opt, $inputCtrl, $selectCtrl );
				//return findFormControl( $formBody, $columnNode, columnType, opt, $inputCtrl, $selectCtrl );

			} catch( e ) {
				if ( opt.debug ) {
					log("Incorrect column value: " + opt.columnName + "\n Please use a valid Display Name.");
				}
				return;
			}
		},
		setProp = function( prop, v ) {
			/***********************************
				implementation needs help..

				FOUND ANSWER:

				http://davidwalsh.name/jquery-objects
				^bada55 JavaScripter btw...


				Want to be able to pass in a string that represent the properties; e.g:
				prop1.List.anotherPropsVal
				and then cache and return the value in the correct position


				maybe? https://gist.github.com/3078593

				http://www.reddit.com/r/javascript/comments/wadv0/recursive_object_and_array_cloning_in_127_bytes/
				https://github.com/jimmycuadra/structure/blob/master/structure.js

			*************************************/
/*
			function (namespaces, value, callback) {
				var i, l, baseObj;

				baseObj = root;
				//_internalProps
				namespaces = namespaces.split(/\./);
				l = namespaces.length;

				for (i = 0; i < l; i++) {
					if (!baseObj[namespaces[i]]) {
						if (i === l - 1 && module) {
							baseObj[namespaces[i]] = module;
						} else {
							baseObj[namespaces[i]] = {};
						}
					}
					baseObj = baseObj[namespaces[i]];
				}

				bindAll(module);

				if (callback) {
				callback(module);
				}
			},


			var arrOfProps = prop.split(/\./),
				arrOfPropsLength = arrOfProps.length,
				//firstProp = arrOfProps[ 0 ],
				//lastProp = arrOfProps[ arrOfPropsLength - 1 ],
				//i = 1,
				returnVal

			; //local vars

			for ( i=0; i < arrOfPropsLength; i++ ) {
				if ( !_internalProps[ arrOfProps[ i ] ] ) {
					if (i === l - 1 && module) {
						_internalProps[ arrOfProps[ i ] ] = value;
					} else {
						_internalProps[ arrOfProps[ i ] ] = {};
					}
				}
				baseObj = baseObj[ arrOfProps[ i ] ];
			}
*/
/*
				if ( !_internalProps.hasOwnProperty( arrOfProps[ arrOfPropsLength - 1 ] ) ) {
					_internalProps[ arrOfProps[ arrOfPropsLength - 1 ] ] = {};
				}
*/

			// checks param for final property in array
/*
			if ( arrOfPropsLength === 1 ) {
				//arguments.callee needs to be in here somewhere...
				return this[ prop ] = v;
			}
*/
/*
			if ( !lastProp ) {
				return this[ firstProp ] = v;
			}
*/
	//		this.call( _internalProps[ arrOfProps[ 0 ] ], arrOfProps, v );

/*
			for ( ; i<=arrOfPropsLength; i++ ) {
				//If prop doesn't exist
				if ( !_internalProps.hasOwnProperty( arrOfProps[ i - 1 ] ) ) {
					_internalProps[ arrOfProps[ i - 1 ] ] = {};
				}



				if ( i === arrOfPropsLength ) {
					_internalProps[ arrOfProps[ i - 1 ] ] = v;
				}
*/

		},
		updateListItems = function( options ) {
			var opt = options || {},
				//used to stop processing if alternate method found.
				altMethodFound = false
			;

			if ( cacheSpUtilsCall( updateListItems, opt ) ) {
				return;
			}

			//Syntax sugar
			try {
				switch ( opt.op.toLowerCase() ) {
					case "delete" :
						altMethodFound = true;
						spUtils.deleteListItems( opt );
						break;

					case "create" :
					case "new" :
						altMethodFound = true;
						spUtils.createListItems( opt );
						break;
				}
			} catch( e ) {

			} finally {
				if ( altMethodFound ) {
					return;
				}
			}

			var context = getWebURL( opt.webUrl ),
				targetList = findList( context, opt.listName ),
				itemToUpdate
			; //local vars


			//debugger;

			try {
				//Single item update
				if ( opt.hasOwnProperty("id") ) {
					var i = 0,
						item = opt.valuePairs

					; //local vars

					itemToUpdate = targetList.getItemById( opt.id );

					//debugger;
					for ( ; i<item.length; i++ ) {
						//log( item[ i ], item[ i + 1] );
						setColumnVal( item[ i ][ 0 ], item[ i ][ 1 ], itemToUpdate );

						//Leave this here Matt!!!!! Leave it alone.... I said DO NOT TOUCH!
						itemToUpdate.update();
					}
				} else {
					//Multi-update yabbage
					for ( var prop in opt.updates ) {
						if ( opt.updates.hasOwnProperty( prop ) ) {
							var item = opt.updates[ prop ]

							; //local vars

							itemToUpdate = targetList.getItemById( prop );

							//debugger;
							for ( var staticName in item ) {
								if ( item.hasOwnProperty( staticName ) ) {
									log( staticName + " : " + item[ staticName ] );
									setColumnVal( staticName, item[ staticName ], itemToUpdate );

									//Leave this here Matt!!!!! Leave it alone.... I said DO NOT TOUCH!
									itemToUpdate.update();
								}
							}
						}
					}
				}
			} catch( e ) {

			}

			var successCallback = options.success || noop;
			//To access list items, similar to callback
			context.executeQueryAsync(
				Function.createDelegate( this, successCallback ),
				Function.createDelegate( this, spCsomError )
			);
		},
		//Global Object
		spUtils = {
			//Expose defautl methods
			createCallback : createCallback,
			createDelegate : createDelegate,
			getProp : getProp,
			getQueryString : getQueryString,
			isoDate : isoDate,
			log : log,
			setProp : setProp
		}
	; //variable declarations


	//map over console if undefined.
	if ( !window.console ) {
		window.console = {
			dir : noop,
			error : noop,
			info : noop,
			log : function( message ) {
				alert( message );
			}
		};
	}

	//Expose methods based on environment booleans
	if ( isSP2013 ) {
		spUtils.startWorkflow = startWorkflow;
	}
	if ( isSP2010 ) {
		spUtils.addStatus = addStatus;
		spUtils.closeDialog = closeDialog;
		spUtils.createListItems = createListItems;
		spUtils.deleteListItems = deleteListItems;
		spUtils.getListItems = getListItems;
		spUtils.notify = notify;
		spUtils.onModalClose = onModalClose;
		spUtils.openModal = openModal;
		spUtils.removeNotify = removeNotify;
		spUtils.removeStatus = removeStatus;
		spUtils.updateListItems = updateListItems;

		//Initialize SP function. Removes the need to wrap spUtils with ExecuteOrDelayUntilScriptLoaded
		executeScript( function() {
			//log( "execute SP" );
			init( _internalProps[ _privy ].onLoadFunctions );
		}, 'sp.js');
	}
	if ( isJquery ) {
		spUtils.getFormValue = getFormValue;
		spUtils.setFormValue = setFormValue;
	}

	//Expose spUtils as a global object
	window[ _spUtils ] = spUtils;
	//console.dir( "spBodyOnLoadFunctionNames: " + _spBodyOnLoadFunctionNames );
})( window );