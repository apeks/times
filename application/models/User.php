<?php

class Times_Model_User extends Zend_Db_Table_Abstract
{
	protected $_name = 'user';
	// get note list
	public function getUsers($where = array(), $order=null, $limit=null){
		$select = $this->select();
		if (count($where) > 0){
			foreach ($where as $key => $value){
				$select->where($key . '=?', $value);
			}
		}
		if ($order){
			return $select->order($order);
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
}

