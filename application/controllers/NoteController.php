<?php
class NoteController extends Zend_Controller_Action {
	public function init() {
		/* Initialize action controller here */
	}
	public function indexAction() {
		// action body
		$modelNote = new Times_Model_Note ();
		$note = $modelNote->getNoteById ( 1 );
		$this->view->note = $note;
	}
	public function listAction() {
		
		$modelNote = new Times_Model_Note ();
		
		if ($this->getRequest ()->isPut ()) {
			$params = Zend_Json::decode ( $this->getRequest ()->getRawBody () );
			$noteId = $modelNote->createNote ( $params );
			$this->view->output = $noteId;
			
		} else if ($this->getRequest()->isGet ()) {
			
			$usersList = $this->getRequest()->getParam("users");
			$users = null;
			if ($usersList){
				$users = preg_split("/[\s,]+/", $usersList, 100);
			}
			$order = 'mtime DESC';
			$limit = null;
			$noteList = $modelNote->getNotes ($users, null, $order, $limit );
			$this->view->output = $noteList;
			
		} else if ($this->getRequest()->isDELETE()) {
			$id = $this->getRequest()->getParam('id');
			$modelNote->deleteNote($id);
			$this->view->output = $id;
		}
	}
}





