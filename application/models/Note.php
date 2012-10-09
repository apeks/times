<?php

class Times_Model_Note extends Zend_Db_Table_Abstract
{
	protected $_name = 'note';
	
	// get a note
	public function getNoteById($id){
		$row = $this->find($id)->current();
		if ($row){
			return $row;
		} else {
			return null;
		}
	}
	
	// get note list	
	public function getNotes($users = array(), $where = array(), $order = null, $limit = null){
		$select = $this->select();
		if (count($users) > 0){
			foreach($users as $user)
			$select->orWhere('user_id=?', $user);
		}
		if (count($where) > 0){
			foreach ($where as $key => $value){
				$select->where($key . '=?', $value);
			}
		}
		if ($order){
			$select->order($order);
		}
		if ($limit){
			$select->limit($limit);
		}
		$result = $this->fetchAll($select);
		if ($result->count() > 0){
			return $result;
		} else {
			return null;
		}
	}
	
	public function createNote($noteData){
		$row = $this->createRow();
		$row->user_id = $noteData['user_id'];
		$row->title = $noteData['title'];
		$row->body  = $noteData['body'];
		$now = time();
		$row->mtime = $now; 
		$row->ctime = $now;
		$row->save();
		return $row->id;
	}
	
	public function deleteNote($id){
		$this->delete('id='.$id);
		return $id;
	}
}

