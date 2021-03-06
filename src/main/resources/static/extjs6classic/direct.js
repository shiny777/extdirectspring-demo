Ext.require([ 'Ext.direct.*', 'Ext.panel.Panel', 'Ext.form.field.Text',
		'Ext.toolbar.TextItem' ]);

Ext.onReady(function() {

	function doEcho(field) {
		testAction.doEcho(field.getValue(), function(result, event) {
			var transaction = event.getTransaction(), content = Ext.String.format(
					'<b>Successful call to {0}.{1} with response:</b><pre>{2}</pre>',
					transaction.action, transaction.method, Ext.encode(result));

			updateMain(content);
			field.reset();
		});
	}

	function doMultiply(field) {
		testAction.multiply(field.getValue(), function(result, event) {
			var transaction = event.getTransaction(), content;

			if (event.status) {
				content = Ext.String.format(
						'<b>Successful call to {0}.{1} with response:</b><pre>{2}</pre>',
						transaction.action, transaction.method, Ext.encode(result));
			}
			else {
				content = Ext.String.format(
						'<b>Call to {0}.{1} failed with message:</b><pre>{2}</pre>',
						transaction.action, transaction.method, event.message);
			}
			updateMain(content);
			field.reset();
		});
	}

	function updateMain(content) {
		main.update({
			data: content
		});
		main.getTargetEl().scroll('b', 100000, true);
	}

	Ext.direct.Manager.addProvider(Ext.app.REMOTING_API, {
		type: 'polling',
		url: Ext.app.POLLING_URLS.message,
		listeners: {
			data: function(provider, event) {
				updateMain('<i>' + event.data + '</i>');
			}
		}
	});

	var es = new EventSource(Ext.app.SSE.poll.sse);
	es.addEventListener('message', function(event) {
		updateMain('<i>' + event.data + '</i>');
	}, false);

	var main = Ext.create('Ext.panel.Panel', {
		// The id is used for styling
		id: 'logger',
		title: 'Remote Call Log',
		renderTo: document.body,
		width: 700,
		height: 300,
		tpl: '<p>{data}</p>',
		tplWriteMode: 'append',
		autoScroll: true,
		bodyPadding: 5,
		dockedItems: [ {
			dock: 'bottom',
			xtype: 'toolbar',
			items: [ {
				hideLabel: true,
				itemId: 'echoText',
				xtype: 'textfield',
				width: 300,
				emptyText: 'Echo input',
				triggers: {
					clear: {
						cls: 'x-form-clear-trigger',
						handler: function(tf) {
						  tf.setValue('');
						}
					}
				},
				listeners: {
					specialkey: function(field, event) {
						if (event.getKey() === event.ENTER) {
							doEcho(field);
						}
					}
				}
			}, {
				itemId: 'echo',
				text: 'Echo',
				handler: function() {
					doEcho(main.down('#echoText'));
				}
			}, '-', {
				hideLabel: true,
				itemId: 'multiplyText',
				xtype: 'numberfield',
				width: 200,
				emptyText: 'Multiply x 8',
				listeners: {
					specialkey: function(field, event) {
						if (event.getKey() === event.ENTER) {
							doMultiply(field);
						}
					}
				}
			}, {
				itemId: 'multiply',
				text: 'Multiply',
				handler: function() {
					doMultiply(main.down('#multiplyText'));
				}
			} ]
		} ]
	});
});
